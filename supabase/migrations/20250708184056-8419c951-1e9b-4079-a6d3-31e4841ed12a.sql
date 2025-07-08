-- Migración para corregir errores en mandatos de compra
-- Ejecutar: supabase db push

-- 1. Verificar y corregir tablas de mandatos
DO $$ 
BEGIN
    -- Verificar si existe la tabla buying_mandates
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'buying_mandates') THEN
        RAISE NOTICE 'Creando tabla buying_mandates...';
        
        CREATE TABLE public.buying_mandates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_name TEXT NOT NULL,
            client_contact TEXT NOT NULL,
            client_email TEXT,
            client_phone TEXT,
            mandate_name TEXT NOT NULL,
            target_sectors TEXT[] NOT NULL DEFAULT '{}',
            target_locations TEXT[] DEFAULT '{}',
            min_revenue NUMERIC,
            max_revenue NUMERIC,
            min_ebitda NUMERIC,
            max_ebitda NUMERIC,
            other_criteria TEXT,
            status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
            start_date DATE NOT NULL DEFAULT CURRENT_DATE,
            end_date DATE,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
    END IF;
END $$;

-- 2. Verificar y corregir tabla mandate_targets
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mandate_targets') THEN
        RAISE NOTICE 'Creando tabla mandate_targets...';
        
        CREATE TABLE public.mandate_targets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
            company_name TEXT NOT NULL,
            sector TEXT,
            location TEXT,
            revenues NUMERIC,
            ebitda NUMERIC,
            contact_name TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            contacted BOOLEAN DEFAULT false,
            contact_date DATE,
            contact_method TEXT,
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'in_analysis', 'interested', 'nda_signed', 'rejected', 'closed')),
            notes TEXT,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- 3. Verificar y corregir tabla mandate_documents
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mandate_documents') THEN
        RAISE NOTICE 'Creando tabla mandate_documents...';
        
        CREATE TABLE public.mandate_documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
            target_id UUID REFERENCES mandate_targets(id) ON DELETE CASCADE,
            document_name TEXT NOT NULL,
            document_type TEXT,
            file_path TEXT,
            file_size INTEGER,
            is_confidential BOOLEAN DEFAULT false,
            uploaded_by UUID REFERENCES auth.users(id),
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- 4. Verificar y corregir tabla mandate_comments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mandate_comments') THEN
        RAISE NOTICE 'Creando tabla mandate_comments...';
        
        CREATE TABLE public.mandate_comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mandate_id UUID NOT NULL REFERENCES buying_mandates(id) ON DELETE CASCADE,
            target_id UUID REFERENCES mandate_targets(id) ON DELETE CASCADE,
            comment_text TEXT NOT NULL,
            comment_type TEXT DEFAULT 'general' CHECK (comment_type IN ('general', 'contact', 'analysis', 'nda', 'financial')),
            is_client_visible BOOLEAN DEFAULT false,
            created_by UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
    END IF;
END $$;

-- 5. Habilitar RLS en todas las tablas
ALTER TABLE public.buying_mandates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_comments ENABLE ROW LEVEL SECURITY;

-- 6. Crear función para actualizar updated_at si no existe
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Crear triggers para updated_at
DO $$ 
BEGIN
    -- Trigger para buying_mandates
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_buying_mandates_updated_at') THEN
        CREATE TRIGGER update_buying_mandates_updated_at
            BEFORE UPDATE ON public.buying_mandates
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Trigger para mandate_targets
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_mandate_targets_updated_at') THEN
        CREATE TRIGGER update_mandate_targets_updated_at
            BEFORE UPDATE ON public.mandate_targets
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- 8. Crear políticas RLS mejoradas para buying_mandates
DROP POLICY IF EXISTS "Users can view buying mandates they created or admin" ON public.buying_mandates;
CREATE POLICY "Users can view buying mandates they created or admin" 
ON public.buying_mandates FOR SELECT 
USING (
    auth.uid() = created_by OR 
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    ) OR
    -- Permitir acceso si no hay tabla user_roles
    NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
);

DROP POLICY IF EXISTS "Users can create buying mandates" ON public.buying_mandates;
CREATE POLICY "Users can create buying mandates" 
ON public.buying_mandates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their buying mandates or admin" ON public.buying_mandates;
CREATE POLICY "Users can update their buying mandates or admin" 
ON public.buying_mandates FOR UPDATE 
USING (
    auth.uid() = created_by OR 
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
    ) OR
    NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles')
);

-- 9. Crear políticas RLS mejoradas para mandate_targets
DROP POLICY IF EXISTS "Users can view mandate targets for their mandates" ON public.mandate_targets;
CREATE POLICY "Users can view mandate targets for their mandates" 
ON public.mandate_targets FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

DROP POLICY IF EXISTS "Users can create mandate targets for their mandates" ON public.mandate_targets;
CREATE POLICY "Users can create mandate targets for their mandates" 
ON public.mandate_targets FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

DROP POLICY IF EXISTS "Users can update mandate targets for their mandates" ON public.mandate_targets;
CREATE POLICY "Users can update mandate targets for their mandates" 
ON public.mandate_targets FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_targets.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

-- 10. Crear políticas para mandate_documents
DROP POLICY IF EXISTS "Users can view mandate documents for their mandates" ON public.mandate_documents;
CREATE POLICY "Users can view mandate documents for their mandates" 
ON public.mandate_documents FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_documents.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

DROP POLICY IF EXISTS "Users can create mandate documents for their mandates" ON public.mandate_documents;
CREATE POLICY "Users can create mandate documents for their mandates" 
ON public.mandate_documents FOR INSERT 
WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_documents.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

-- 11. Crear políticas para mandate_comments
DROP POLICY IF EXISTS "Users can view mandate comments for their mandates" ON public.mandate_comments;
CREATE POLICY "Users can view mandate comments for their mandates" 
ON public.mandate_comments FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_comments.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

DROP POLICY IF EXISTS "Users can create mandate comments for their mandates" ON public.mandate_comments;
CREATE POLICY "Users can create mandate comments for their mandates" 
ON public.mandate_comments FOR INSERT 
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM public.buying_mandates 
        WHERE id = mandate_comments.mandate_id 
        AND (created_by = auth.uid() OR EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        ) OR
        NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles'))
    )
);

-- 12. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_buying_mandates_created_by ON public.buying_mandates(created_by);
CREATE INDEX IF NOT EXISTS idx_buying_mandates_status ON public.buying_mandates(status);
CREATE INDEX IF NOT EXISTS idx_mandate_targets_mandate_id ON public.mandate_targets(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_targets_status ON public.mandate_targets(status);
CREATE INDEX IF NOT EXISTS idx_mandate_documents_mandate_id ON public.mandate_documents(mandate_id);
CREATE INDEX IF NOT EXISTS idx_mandate_comments_mandate_id ON public.mandate_comments(mandate_id);

-- 13. Insertar datos de prueba si no hay mandatos
INSERT INTO public.buying_mandates (
    client_name, 
    client_contact, 
    mandate_name, 
    target_sectors, 
    start_date
) 
SELECT 
    'Cliente de Prueba',
    'Contacto de Prueba',
    'Mandato de Prueba',
    ARRAY['Tecnología', 'Software'],
    CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.buying_mandates LIMIT 1);

-- 14. Log de la migración
DO $$
BEGIN
    RAISE NOTICE 'Migración de corrección de mandatos completada exitosamente';
    RAISE NOTICE 'Tablas verificadas: buying_mandates, mandate_targets, mandate_documents, mandate_comments';
    RAISE NOTICE 'Políticas RLS actualizadas';
    RAISE NOTICE 'Índices creados para optimizar rendimiento';
END $$;