-- Fase 4: Flujos de trabajo y aprobaciones
-- Estados de flujo de trabajo
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_required');

-- Flujos de trabajo de documentos
CREATE TABLE public.document_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  workflow_steps JSONB NOT NULL DEFAULT '[]', -- Array de pasos del workflow
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Asignación de workflows a documentos
CREATE TABLE public.document_workflow_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES public.document_workflows(id),
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  started_by UUID REFERENCES auth.users(id) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Aprobaciones de documentos
CREATE TABLE public.document_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  workflow_instance_id UUID REFERENCES public.document_workflow_instances(id),
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  step_number INTEGER NOT NULL,
  status approval_status DEFAULT 'pending',
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Historial de estados de documentos
CREATE TABLE public.document_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id) NOT NULL,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimización
CREATE INDEX idx_document_workflows_created_by ON public.document_workflows(created_by);
CREATE INDEX idx_document_workflow_instances_document_id ON public.document_workflow_instances(document_id);
CREATE INDEX idx_document_workflow_instances_workflow_id ON public.document_workflow_instances(workflow_id);
CREATE INDEX idx_document_approvals_document_id ON public.document_approvals(document_id);
CREATE INDEX idx_document_approvals_approver_id ON public.document_approvals(approver_id);
CREATE INDEX idx_document_approvals_status ON public.document_approvals(status);
CREATE INDEX idx_document_status_history_document_id ON public.document_status_history(document_id);

-- RLS Policies para workflows
ALTER TABLE public.document_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflows they created or can use" 
ON public.document_workflows FOR SELECT 
USING (
  created_by = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "Users can create workflows" 
ON public.document_workflows FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own workflows or admins" 
ON public.document_workflows FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

-- RLS Policies para instancias de workflow
ALTER TABLE public.document_workflow_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow instances for accessible documents" 
ON public.document_workflow_instances FOR SELECT 
USING (
  public.check_document_permission(document_id, auth.uid(), 'view') OR
  EXISTS (
    SELECT 1 FROM document_approvals da 
    WHERE da.workflow_instance_id = document_workflow_instances.id 
    AND da.approver_id = auth.uid()
  )
);

CREATE POLICY "Users can create workflow instances for their documents" 
ON public.document_workflow_instances FOR INSERT 
WITH CHECK (
  auth.uid() = started_by AND 
  public.check_document_permission(document_id, auth.uid(), 'manage')
);

CREATE POLICY "Users can update workflow instances they started or approvers" 
ON public.document_workflow_instances FOR UPDATE 
USING (
  started_by = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM document_approvals da 
    WHERE da.workflow_instance_id = document_workflow_instances.id 
    AND da.approver_id = auth.uid()
  ) OR
  public.check_document_permission(document_id, auth.uid(), 'manage')
);

-- RLS Policies para aprobaciones
ALTER TABLE public.document_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view approvals for accessible documents" 
ON public.document_approvals FOR SELECT 
USING (
  approver_id = auth.uid() OR 
  public.check_document_permission(document_id, auth.uid(), 'view') OR
  EXISTS (
    SELECT 1 FROM documents d 
    WHERE d.id = document_approvals.document_id AND d.created_by = auth.uid()
  )
);

CREATE POLICY "System can create approvals" 
ON public.document_approvals FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Approvers can update their approvals" 
ON public.document_approvals FOR UPDATE 
USING (approver_id = auth.uid());

-- RLS Policies para historial de estados
ALTER TABLE public.document_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view status history for accessible documents" 
ON public.document_status_history FOR SELECT 
USING (
  public.check_document_permission(document_id, auth.uid(), 'view')
);

CREATE POLICY "System can create status history" 
ON public.document_status_history FOR INSERT 
WITH CHECK (true);

-- Triggers para timestamps
CREATE TRIGGER update_document_workflows_updated_at
  BEFORE UPDATE ON public.document_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_document_approvals_updated_at
  BEFORE UPDATE ON public.document_approvals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para iniciar un workflow
CREATE OR REPLACE FUNCTION public.start_document_workflow(
  p_document_id UUID,
  p_workflow_id UUID
) RETURNS UUID AS $$
DECLARE
  workflow_instance_id UUID;
  workflow_steps JSONB;
  step_data JSONB;
  approver_id UUID;
BEGIN
  -- Obtener pasos del workflow
  SELECT workflow_steps INTO workflow_steps
  FROM document_workflows
  WHERE id = p_workflow_id AND is_active = true;
  
  IF workflow_steps IS NULL THEN
    RAISE EXCEPTION 'Workflow no encontrado o inactivo';
  END IF;
  
  -- Crear instancia del workflow
  INSERT INTO public.document_workflow_instances (
    document_id, workflow_id, started_by
  ) VALUES (
    p_document_id, p_workflow_id, auth.uid()
  ) RETURNING id INTO workflow_instance_id;
  
  -- Crear aprobaciones para cada paso
  FOR i IN 0..jsonb_array_length(workflow_steps) - 1 LOOP
    step_data := workflow_steps -> i;
    approver_id := (step_data ->> 'approver_id')::UUID;
    
    INSERT INTO public.document_approvals (
      document_id,
      workflow_instance_id,
      approver_id,
      step_number,
      due_date
    ) VALUES (
      p_document_id,
      workflow_instance_id,
      approver_id,
      i + 1,
      CASE 
        WHEN step_data ->> 'due_days' IS NOT NULL 
        THEN now() + (step_data ->> 'due_days')::INTEGER * INTERVAL '1 day'
        ELSE now() + INTERVAL '7 days'
      END
    );
  END LOOP;
  
  -- Actualizar estado del documento
  UPDATE documents 
  SET status = 'pending_approval'
  WHERE id = p_document_id;
  
  -- Crear historial de estado
  INSERT INTO public.document_status_history (
    document_id, previous_status, new_status, changed_by, reason
  ) VALUES (
    p_document_id, 'draft', 'pending_approval', auth.uid(), 'Workflow iniciado'
  );
  
  -- Crear notificación para el primer aprobador
  INSERT INTO public.document_notifications (
    user_id, document_id, notification_type, title, message
  ) VALUES (
    (SELECT approver_id FROM document_approvals 
     WHERE workflow_instance_id = workflow_instance_id AND step_number = 1),
    p_document_id,
    'permission_granted',
    'Documento pendiente de aprobación',
    'Tienes un documento pendiente de aprobación'
  );
  
  RETURN workflow_instance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Función para procesar una aprobación
CREATE OR REPLACE FUNCTION public.process_approval(
  p_approval_id UUID,
  p_status approval_status,
  p_comments TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  approval_rec RECORD;
  workflow_instance_rec RECORD;
  next_approval_id UUID;
  is_final_step BOOLEAN := false;
BEGIN
  -- Obtener información de la aprobación
  SELECT * INTO approval_rec
  FROM document_approvals
  WHERE id = p_approval_id AND approver_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aprobación no encontrada o sin permisos';
  END IF;
  
  -- Verificar que está pendiente
  IF approval_rec.status != 'pending' THEN
    RAISE EXCEPTION 'Esta aprobación ya fue procesada';
  END IF;
  
  -- Actualizar la aprobación
  UPDATE document_approvals
  SET 
    status = p_status,
    comments = p_comments,
    approved_at = now(),
    updated_at = now()
  WHERE id = p_approval_id;
  
  -- Si fue rechazada, marcar el workflow como cancelado
  IF p_status = 'rejected' THEN
    UPDATE document_workflow_instances
    SET status = 'cancelled', completed_at = now()
    WHERE id = approval_rec.workflow_instance_id;
    
    UPDATE documents
    SET status = 'rejected'
    WHERE id = approval_rec.document_id;
    
    -- Crear historial
    INSERT INTO public.document_status_history (
      document_id, previous_status, new_status, changed_by, reason
    ) VALUES (
      approval_rec.document_id, 'pending_approval', 'rejected', 
      auth.uid(), 'Documento rechazado: ' || COALESCE(p_comments, '')
    );
    
    RETURN true;
  END IF;
  
  -- Si requiere revisión, notificar al creador
  IF p_status = 'revision_required' THEN
    UPDATE documents
    SET status = 'revision_required'
    WHERE id = approval_rec.document_id;
    
    -- Crear notificación
    INSERT INTO public.document_notifications (
      user_id, document_id, notification_type, title, message
    ) VALUES (
      (SELECT created_by FROM documents WHERE id = approval_rec.document_id),
      approval_rec.document_id,
      'comment',
      'Documento requiere revisión',
      'Tu documento requiere revisiones: ' || COALESCE(p_comments, '')
    );
    
    RETURN true;
  END IF;
  
  -- Si fue aprobada, verificar si es el último paso
  SELECT COUNT(*) = approval_rec.step_number INTO is_final_step
  FROM document_approvals
  WHERE workflow_instance_id = approval_rec.workflow_instance_id;
  
  IF is_final_step THEN
    -- Completar workflow
    UPDATE document_workflow_instances
    SET status = 'completed', completed_at = now()
    WHERE id = approval_rec.workflow_instance_id;
    
    UPDATE documents
    SET status = 'approved'
    WHERE id = approval_rec.document_id;
    
    -- Crear historial
    INSERT INTO public.document_status_history (
      document_id, previous_status, new_status, changed_by, reason
    ) VALUES (
      approval_rec.document_id, 'pending_approval', 'approved', 
      auth.uid(), 'Documento aprobado completamente'
    );
  ELSE
    -- Notificar al siguiente aprobador
    SELECT id INTO next_approval_id
    FROM document_approvals
    WHERE workflow_instance_id = approval_rec.workflow_instance_id
    AND step_number = approval_rec.step_number + 1;
    
    INSERT INTO public.document_notifications (
      user_id, document_id, notification_type, title, message
    ) VALUES (
      (SELECT approver_id FROM document_approvals WHERE id = next_approval_id),
      approval_rec.document_id,
      'permission_granted',
      'Documento pendiente de aprobación',
      'Tienes un documento pendiente de aprobación'
    );
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Habilitar realtime para workflows
ALTER TABLE public.document_workflows REPLICA IDENTITY FULL;
ALTER TABLE public.document_workflow_instances REPLICA IDENTITY FULL;
ALTER TABLE public.document_approvals REPLICA IDENTITY FULL;
ALTER TABLE public.document_status_history REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.document_workflows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_workflow_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.document_status_history;