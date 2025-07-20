
-- Crear tabla para actividades de mandatos de compra
CREATE TABLE public.mandate_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_data JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para tareas de mandatos
CREATE TABLE public.mandate_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla para documentos de mandatos
CREATE TABLE public.mandate_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.mandate_targets(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'general' CHECK (document_type IN ('teaser', 'memo', 'financial', 'legal', 'nda', 'general')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  is_confidential BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para personas relacionadas con mandatos
CREATE TABLE public.mandate_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  company TEXT,
  role_in_mandate TEXT DEFAULT 'contact',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para interesados en mandatos
CREATE TABLE public.mandate_interested_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mandate_id UUID NOT NULL REFERENCES public.buying_mandates(id) ON DELETE CASCADE,
  target_id UUID REFERENCES public.mandate_targets(id) ON DELETE SET NULL,
  party_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  interest_level TEXT DEFAULT 'initial' CHECK (interest_level IN ('initial', 'low', 'medium', 'high', 'very_high')),
  status TEXT DEFAULT 'contacted' CHECK (status IN ('contacted', 'interested', 'evaluating', 'declined', 'negotiating')),
  notes TEXT,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.mandate_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandate_interested_parties ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para mandate_activities
CREATE POLICY "Users can view mandate activities"
ON public.mandate_activities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_activities.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate activities"
ON public.mandate_activities FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Políticas RLS para mandate_tasks
CREATE POLICY "Users can view mandate tasks"
ON public.mandate_tasks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_tasks.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate tasks"
ON public.mandate_tasks FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update mandate tasks"
ON public.mandate_tasks FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Políticas RLS para mandate_documents
CREATE POLICY "Users can view mandate documents"
ON public.mandate_documents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_documents.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate documents"
ON public.mandate_documents FOR INSERT
WITH CHECK (auth.uid() = uploaded_by);

-- Políticas RLS para mandate_people
CREATE POLICY "Users can view mandate people"
ON public.mandate_people FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_people.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate people"
ON public.mandate_people FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Políticas RLS para mandate_interested_parties
CREATE POLICY "Users can view mandate interested parties"
ON public.mandate_interested_parties FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.buying_mandates 
  WHERE id = mandate_interested_parties.mandate_id 
  AND (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  ))
));

CREATE POLICY "Users can create mandate interested parties"
ON public.mandate_interested_parties FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Triggers para updated_at
CREATE TRIGGER update_mandate_activities_updated_at
  BEFORE UPDATE ON public.mandate_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_tasks_updated_at
  BEFORE UPDATE ON public.mandate_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_documents_updated_at
  BEFORE UPDATE ON public.mandate_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_people_updated_at
  BEFORE UPDATE ON public.mandate_people
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mandate_interested_parties_updated_at
  BEFORE UPDATE ON public.mandate_interested_parties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
