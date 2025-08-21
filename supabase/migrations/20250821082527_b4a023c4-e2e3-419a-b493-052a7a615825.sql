-- Fix remaining tables without RLS policies
CREATE POLICY "collaborator_performance_policy" ON public.collaborator_performance
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "collaborator_territories_policy" ON public.collaborator_territories
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "commission_calculations_policy" ON public.commission_calculations
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin') OR
  collaborator_id IN (
    SELECT id FROM collaborators WHERE user_id = auth.uid()
  )
);

CREATE POLICY "commission_escrow_policy" ON public.commission_escrow
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

-- Enable RLS on tables that don't have it
ALTER TABLE public.colaboradores_beneficios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_bonus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_objetivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colaboradores_rangos ENABLE ROW LEVEL SECURITY;

-- Add policies for newly RLS-enabled tables
CREATE POLICY "colaboradores_beneficios_policy" ON public.colaboradores_beneficios
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "colaboradores_bonus_policy" ON public.colaboradores_bonus  
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "colaboradores_evaluaciones_policy" ON public.colaboradores_evaluaciones
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "colaboradores_objetivos_policy" ON public.colaboradores_objetivos
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

CREATE POLICY "colaboradores_rangos_policy" ON public.colaboradores_rangos
FOR ALL USING (
  has_role_secure(auth.uid(), 'admin') OR 
  has_role_secure(auth.uid(), 'superadmin')
);

-- Fix functions missing search_path (most critical ones)
CREATE OR REPLACE FUNCTION public.get_einforma_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  config jsonb := '{}'::jsonb;
BEGIN
  SELECT jsonb_build_object(
    'base_url', COALESCE(ds1.decrypted_secret, 'https://ws.einforma.com'),
    'api_user', COALESCE(ds2.decrypted_secret, ''),
    'api_password', COALESCE(ds3.decrypted_secret, '')
  ) INTO config
  FROM vault.decrypted_secrets ds1
  FULL OUTER JOIN vault.decrypted_secrets ds2 ON ds2.name = 'EINFORMA_API_USER'
  FULL OUTER JOIN vault.decrypted_secrets ds3 ON ds3.name = 'EINFORMA_API_PASSWORD'
  WHERE ds1.name = 'EINFORMA_BASE_URL';
  
  RETURN config;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.enhanced_log_security_event(
      'einforma_config_retrieval_failed',
      'high',
      'Failed to retrieve eInforma configuration: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '{}'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_quantum_config()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  config jsonb := '{}'::jsonb;
BEGIN
  SELECT jsonb_build_object(
    'base_url', COALESCE(ds1.decrypted_secret, 'https://api.quantumeconomics.com'),
    'token', COALESCE(ds2.decrypted_secret, '')
  ) INTO config
  FROM vault.decrypted_secrets ds1
  FULL OUTER JOIN vault.decrypted_secrets ds2 ON ds2.name = 'QUANTUM_TOKEN'
  WHERE ds1.name = 'QUANTUM_BASE_URL';
  
  RETURN config;
EXCEPTION
  WHEN OTHERS THEN
    PERFORM public.enhanced_log_security_event(
      'quantum_config_retrieval_failed',
      'high',
      'Failed to retrieve Quantum configuration: ' || SQLERRM,
      jsonb_build_object('error', SQLERRM)
    );
    RETURN '{}'::jsonb;
END;
$$;