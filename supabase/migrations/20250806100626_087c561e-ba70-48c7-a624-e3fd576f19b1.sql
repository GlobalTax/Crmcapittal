-- Crear tabla de equipos
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de miembros de equipos (relación many-to-many)
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  added_by UUID REFERENCES auth.users(id),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para teams
CREATE POLICY "Users can view teams they are members of or created" 
ON public.teams 
FOR SELECT 
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = teams.id AND user_id = auth.uid()
  ) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Users can create teams" 
ON public.teams 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators and admins can update teams" 
ON public.teams 
FOR UPDATE 
USING (
  auth.uid() = created_by OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Team creators and admins can delete teams" 
ON public.teams 
FOR DELETE 
USING (
  auth.uid() = created_by OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Políticas RLS para team_members
CREATE POLICY "Users can view team members of teams they belong to" 
ON public.team_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_members.team_id AND 
    (created_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members tm2 
      WHERE tm2.team_id = teams.id AND tm2.user_id = auth.uid()
    ))
  ) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Team creators can add members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_members.team_id AND created_by = auth.uid()
  ) OR
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

CREATE POLICY "Team creators can remove members" 
ON public.team_members 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.teams 
    WHERE id = team_members.team_id AND created_by = auth.uid()
  ) OR
  auth.uid() = user_id OR -- Users can remove themselves
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Trigger para actualizar updated_at en teams
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para obtener equipos con conteo de miembros
CREATE OR REPLACE FUNCTION public.get_teams_with_member_count()
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  member_count BIGINT,
  creator_name TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.description,
    t.created_by,
    t.created_at,
    t.updated_at,
    COALESCE(tm_count.member_count, 0) as member_count,
    COALESCE(up.first_name || ' ' || up.last_name, 'Usuario') as creator_name
  FROM public.teams t
  LEFT JOIN (
    SELECT team_id, COUNT(*) as member_count
    FROM public.team_members
    GROUP BY team_id
  ) tm_count ON t.id = tm_count.team_id
  LEFT JOIN public.user_profiles up ON t.created_by = up.id
  WHERE (
    t.created_by = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = t.id AND tm.user_id = auth.uid()
    ) OR
    has_role_secure(auth.uid(), 'admin'::app_role) OR 
    has_role_secure(auth.uid(), 'superadmin'::app_role)
  )
  ORDER BY t.created_at DESC;
END;
$$;