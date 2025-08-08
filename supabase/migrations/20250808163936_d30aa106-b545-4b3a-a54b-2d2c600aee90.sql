
-- 1) Tablas necesarias

-- Tabla de feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  organization_id uuid NULL,
  environment text NULL,
  rollout_percentage integer NULL CHECK (rollout_percentage BETWEEN 0 AND 100),
  description text NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices/Únicos para evitar duplicados por ámbito
CREATE UNIQUE INDEX IF NOT EXISTS feature_flags_key_org_env_uniq
  ON public.feature_flags (key, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(environment, ''))
;

CREATE INDEX IF NOT EXISTS feature_flags_key_idx
  ON public.feature_flags (key);

CREATE INDEX IF NOT EXISTS feature_flags_env_idx
  ON public.feature_flags (environment);

-- Trigger de updated_at (usa función existente public.handle_updated_at)
DROP TRIGGER IF EXISTS trg_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER trg_feature_flags_updated_at
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();

-- RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Solo admins/superadmins pueden crear/editar/borrar flags
DROP POLICY IF EXISTS feature_flags_admin_all ON public.feature_flags;
CREATE POLICY feature_flags_admin_all
ON public.feature_flags
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
)
WITH CHECK (
  has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- Usuarios autenticados pueden leer flags (acceso de solo lectura)
DROP POLICY IF EXISTS feature_flags_select_all ON public.feature_flags;
CREATE POLICY feature_flags_select_all
ON public.feature_flags
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (true);

-- Tabla de analítica de funcionalidades
CREATE TABLE IF NOT EXISTS public.feature_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL,
  action text NOT NULL,
  user_id uuid NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS feature_analytics_feat_action_time_idx
  ON public.feature_analytics (feature_key, action, timestamp DESC);

-- RLS
ALTER TABLE public.feature_analytics ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede insertar eventos
DROP POLICY IF EXISTS feature_analytics_insert ON public.feature_analytics;
CREATE POLICY feature_analytics_insert
ON public.feature_analytics
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Solo admins/superadmins pueden leer analítica
DROP POLICY IF EXISTS feature_analytics_select_admin ON public.feature_analytics;
CREATE POLICY feature_analytics_select_admin
ON public.feature_analytics
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  has_role_secure(auth.uid(), 'admin'::app_role)
  OR has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- 2) Vista de adopción para dashboard interno
DROP VIEW IF EXISTS public.feature_adoption_summary;
CREATE VIEW public.feature_adoption_summary AS
WITH base AS (
  SELECT
    date_trunc('day', "timestamp") AS metric_day,
    feature_key,
    COALESCE(metadata->>'environment','unknown') AS environment,
    action
  FROM public.feature_analytics
)
SELECT
  metric_day::date AS metric_date,
  feature_key,
  environment,
  COUNT(*) FILTER (WHERE action = 'dialog_opened') AS dialog_opened,
  COUNT(*) FILTER (WHERE action = 'entity_created') AS entity_created,
  COUNT(*) FILTER (WHERE action = 'entity_creation_failed') AS entity_creation_failed,
  CASE
    WHEN (COUNT(*) FILTER (WHERE action IN ('entity_created','entity_creation_failed'))) = 0
      THEN 0
    ELSE ROUND(
      (COUNT(*) FILTER (WHERE action = 'entity_created'))::numeric
      / NULLIF((COUNT(*) FILTER (WHERE action IN ('entity_created','entity_creation_failed'))), 0)
    , 4)
  END AS success_rate
FROM base
GROUP BY metric_day, feature_key, environment
ORDER BY metric_day DESC;

-- 3) Seed inicial del flag para desarrollo
INSERT INTO public.feature_flags (key, enabled, environment, rollout_percentage, description)
VALUES ('lead_closure_dialog', true, 'development', 100, 'Enable lead closure dialog in development')
ON CONFLICT (key, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid), COALESCE(environment, ''))
DO NOTHING;
