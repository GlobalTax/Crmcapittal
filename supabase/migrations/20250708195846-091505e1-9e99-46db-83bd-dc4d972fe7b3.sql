-- Limpiar y corregir políticas RLS para mandate_targets
-- Eliminar todas las políticas existentes que causan conflictos
DROP POLICY IF EXISTS "Users can view mandate targets for their mandates" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can create mandate targets for their mandates" ON public.mandate_targets;
DROP POLICY IF EXISTS "Users can update mandate targets for their mandates" ON public.mandate_targets;

-- Crear políticas RLS más simples y efectivas
-- Política para SELECT - permite ver targets si el usuario puede ver el mandato
CREATE POLICY "Users can view mandate targets" 
ON public.mandate_targets FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND (
            created_by = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'superadmin')
            )
        )
    )
);

-- Política para INSERT - permite crear targets si el usuario puede acceder al mandato
CREATE POLICY "Users can create mandate targets" 
ON public.mandate_targets FOR INSERT 
WITH CHECK (
    -- Verificar que el usuario autenticado coincide con created_by
    auth.uid() = created_by AND
    -- Verificar que el mandato existe y el usuario puede acceder a él
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND (
            created_by = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'superadmin')
            )
        )
    )
);

-- Política para UPDATE - permite actualizar targets del mandato
CREATE POLICY "Users can update mandate targets" 
ON public.mandate_targets FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND (
            created_by = auth.uid() OR 
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() 
                AND role IN ('admin', 'superadmin')
            )
        )
    )
);

-- Política para DELETE - permite eliminar targets del mandato (solo para admin/superadmin)
CREATE POLICY "Admin users can delete mandate targets" 
ON public.mandate_targets FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    )
);

-- Verificar que la tabla mandate_client_access existe, si no, crearla
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mandate_client_access') THEN
        CREATE TABLE public.mandate_client_access (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
            client_name TEXT NOT NULL,
            client_email TEXT NOT NULL,
            access_token TEXT NOT NULL UNIQUE,
            access_level TEXT DEFAULT 'read_only' CHECK (access_level IN ('read_only', 'comment', 'full')),
            expires_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT true,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            last_accessed TIMESTAMP WITH TIME ZONE
        );
        
        -- Habilitar RLS
        ALTER TABLE public.mandate_client_access ENABLE ROW LEVEL SECURITY;
        
        -- Políticas para mandate_client_access
        CREATE POLICY "Users can view client access for their mandates" 
        ON public.mandate_client_access FOR SELECT 
        USING (
            EXISTS (
                SELECT 1 FROM public.buying_mandates 
                WHERE id = mandate_client_access.mandate_id 
                AND (
                    created_by = auth.uid() OR 
                    EXISTS (
                        SELECT 1 FROM public.user_roles 
                        WHERE user_id = auth.uid() 
                        AND role IN ('admin', 'superadmin')
                    )
                )
            )
        );
        
        CREATE POLICY "Users can create client access for their mandates" 
        ON public.mandate_client_access FOR INSERT 
        WITH CHECK (
            auth.uid() = created_by AND
            EXISTS (
                SELECT 1 FROM public.buying_mandates 
                WHERE id = mandate_client_access.mandate_id 
                AND (
                    created_by = auth.uid() OR 
                    EXISTS (
                        SELECT 1 FROM public.user_roles 
                        WHERE user_id = auth.uid() 
                        AND role IN ('admin', 'superadmin')
                    )
                )
            )
        );
    END IF;
END $$;

-- Log de la migración
DO $$
BEGIN
    RAISE NOTICE 'Migración de políticas RLS para mandate_targets completada';
    RAISE NOTICE 'Políticas simplificadas y verificación de mandate_client_access realizada';
END $$;