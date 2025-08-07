-- Fase 2: Permisos Granulares & Sharing

-- Tabla de permisos granulares por documento
CREATE TABLE public.document_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES public.teams(id),
  permission_type TEXT NOT NULL CHECK (permission_type IN ('owner', 'editor', 'viewer', 'commenter')),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(document_id, user_id),
  UNIQUE(document_id, team_id),
  CHECK ((user_id IS NOT NULL AND team_id IS NULL) OR (user_id IS NULL AND team_id IS NOT NULL))
);

-- Tabla de enlaces compartidos
CREATE TABLE public.document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  password_hash TEXT,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  watermark_enabled BOOLEAN DEFAULT false,
  download_allowed BOOLEAN DEFAULT true,
  print_allowed BOOLEAN DEFAULT true,
  share_type TEXT DEFAULT 'view' CHECK (share_type IN ('view', 'comment', 'edit')),
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Tabla de log de accesos a documentos compartidos
CREATE TABLE public.document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  share_id UUID REFERENCES public.document_shares(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'print', 'edit')),
  session_duration INTEGER, -- en segundos
  metadata JSONB DEFAULT '{}',
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_document_permissions_document_id ON public.document_permissions(document_id);
CREATE INDEX idx_document_permissions_user_id ON public.document_permissions(user_id);
CREATE INDEX idx_document_permissions_team_id ON public.document_permissions(team_id);
CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_shares_token ON public.document_shares(share_token);
CREATE INDEX idx_document_access_logs_document_id ON public.document_access_logs(document_id);
CREATE INDEX idx_document_access_logs_accessed_at ON public.document_access_logs(accessed_at);

-- Triggers para updated_at
CREATE TRIGGER update_document_permissions_updated_at
  BEFORE UPDATE ON public.document_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_shares_updated_at
  BEFORE UPDATE ON public.document_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Políticas RLS
ALTER TABLE public.document_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS para document_permissions
CREATE POLICY "Users can view permissions for documents they can access"
ON public.document_permissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_permissions.document_id 
    AND (documents.created_by = auth.uid() OR documents.id IN (
      SELECT dp.document_id FROM public.document_permissions dp
      WHERE dp.user_id = auth.uid() AND dp.permission_type IN ('owner', 'editor', 'viewer', 'commenter')
    ))
  )
);

CREATE POLICY "Document owners can manage permissions"
ON public.document_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_permissions.document_id 
    AND documents.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.document_permissions dp
    WHERE dp.document_id = document_permissions.document_id
    AND dp.user_id = auth.uid()
    AND dp.permission_type = 'owner'
  )
);

-- RLS para document_shares
CREATE POLICY "Users can view shares for documents they can access"
ON public.document_shares FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_shares.document_id 
    AND (documents.created_by = auth.uid() OR documents.id IN (
      SELECT dp.document_id FROM public.document_permissions dp
      WHERE dp.user_id = auth.uid() AND dp.permission_type IN ('owner', 'editor')
    ))
  )
);

CREATE POLICY "Document owners and editors can manage shares"
ON public.document_shares FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_shares.document_id 
    AND documents.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.document_permissions dp
    WHERE dp.document_id = document_shares.document_id
    AND dp.user_id = auth.uid()
    AND dp.permission_type IN ('owner', 'editor')
  )
);

-- RLS para document_access_logs
CREATE POLICY "Users can view access logs for their documents"
ON public.document_access_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents 
    WHERE documents.id = document_access_logs.document_id 
    AND documents.created_by = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.document_permissions dp
    WHERE dp.document_id = document_access_logs.document_id
    AND dp.user_id = auth.uid()
    AND dp.permission_type = 'owner'
  )
);

CREATE POLICY "System can insert access logs"
ON public.document_access_logs FOR INSERT
WITH CHECK (true);

-- Función para verificar permisos de documento
CREATE OR REPLACE FUNCTION public.check_document_permission(
  p_document_id UUID,
  p_user_id UUID,
  p_required_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar si es el creador del documento
  IF EXISTS (
    SELECT 1 FROM documents 
    WHERE id = p_document_id AND created_by = p_user_id
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar permisos específicos
  RETURN EXISTS (
    SELECT 1 FROM document_permissions dp
    WHERE dp.document_id = p_document_id 
    AND dp.user_id = p_user_id
    AND (
      CASE p_required_permission
        WHEN 'view' THEN dp.permission_type IN ('owner', 'editor', 'viewer', 'commenter')
        WHEN 'comment' THEN dp.permission_type IN ('owner', 'editor', 'commenter')
        WHEN 'edit' THEN dp.permission_type IN ('owner', 'editor')
        WHEN 'manage' THEN dp.permission_type = 'owner'
        ELSE FALSE
      END
    )
    AND (dp.expires_at IS NULL OR dp.expires_at > now())
  );
END;
$$;

-- Función para registrar accesos
CREATE OR REPLACE FUNCTION public.log_document_access(
  p_document_id UUID,
  p_share_id UUID DEFAULT NULL,
  p_access_type TEXT DEFAULT 'view',
  p_session_duration INTEGER DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO document_access_logs (
    document_id,
    share_id,
    user_id,
    ip_address,
    user_agent,
    access_type,
    session_duration,
    metadata
  ) VALUES (
    p_document_id,
    p_share_id,
    auth.uid(),
    inet_client_addr(),
    current_setting('request.headers', true)::jsonb->>'user-agent',
    p_access_type,
    p_session_duration,
    p_metadata
  ) RETURNING id INTO log_id;
  
  -- Actualizar contador de views si es un share link
  IF p_share_id IS NOT NULL AND p_access_type = 'view' THEN
    UPDATE document_shares 
    SET current_views = current_views + 1
    WHERE id = p_share_id;
  END IF;
  
  RETURN log_id;
END;
$$;