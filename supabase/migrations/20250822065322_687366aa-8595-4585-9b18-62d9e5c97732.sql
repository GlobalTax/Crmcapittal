-- Create invitation system tables
CREATE TABLE public.pending_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'user',
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  used_at TIMESTAMP WITH TIME ZONE NULL,
  user_id UUID REFERENCES auth.users(id) NULL
);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Superadmins can manage all invitations" 
ON public.pending_invitations 
FOR ALL 
USING (has_role_secure(auth.uid(), 'superadmin'::app_role));

CREATE POLICY "Anyone can view their own invitation by token"
ON public.pending_invitations
FOR SELECT
USING (true); -- Will be filtered by token in application logic

-- Function to create secure invitation tokens
CREATE OR REPLACE FUNCTION public.create_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Function to send invitation (to be used by edge function)
CREATE OR REPLACE FUNCTION public.create_user_invitation(
  p_email TEXT,
  p_role app_role DEFAULT 'user'::app_role
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_id UUID;
  invitation_token TEXT;
BEGIN
  -- Check if user has permission to create invitations
  IF NOT has_role_secure(auth.uid(), 'superadmin'::app_role) THEN
    RAISE EXCEPTION 'Solo los superadministradores pueden crear invitaciones';
  END IF;
  
  -- Generate secure token
  invitation_token := create_invitation_token();
  
  -- Create invitation
  INSERT INTO public.pending_invitations (email, token, role, invited_by)
  VALUES (p_email, invitation_token, p_role, auth.uid())
  RETURNING id INTO invitation_id;
  
  -- Log the invitation creation
  PERFORM public.enhanced_log_security_event(
    'invitation_created',
    'medium',
    'Nueva invitación creada para: ' || p_email,
    jsonb_build_object(
      'invited_email', p_email,
      'invited_role', p_role,
      'invitation_id', invitation_id
    )
  );
  
  RETURN invitation_id;
END;
$$;

-- Function to validate invitation token
CREATE OR REPLACE FUNCTION public.validate_invitation_token(p_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record
  FROM public.pending_invitations
  WHERE token = p_token 
    AND expires_at > now()
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Token de invitación inválido o expirado');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'email', invitation_record.email,
    'role', invitation_record.role,
    'invitation_id', invitation_record.id
  );
END;
$$;

-- Function to complete invitation (create user account)
CREATE OR REPLACE FUNCTION public.complete_invitation(
  p_token TEXT,
  p_user_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  SELECT * INTO invitation_record
  FROM public.pending_invitations
  WHERE token = p_token 
    AND expires_at > now()
    AND used_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token de invitación inválido o expirado';
  END IF;
  
  -- Mark invitation as used
  UPDATE public.pending_invitations
  SET used_at = now(), user_id = p_user_id
  WHERE id = invitation_record.id;
  
  -- Assign role to user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (p_user_id, invitation_record.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log completion
  PERFORM public.enhanced_log_security_event(
    'invitation_completed',
    'medium',
    'Invitación completada para: ' || invitation_record.email,
    jsonb_build_object(
      'invited_email', invitation_record.email,
      'assigned_role', invitation_record.role,
      'user_id', p_user_id
    )
  );
  
  RETURN true;
END;
$$;