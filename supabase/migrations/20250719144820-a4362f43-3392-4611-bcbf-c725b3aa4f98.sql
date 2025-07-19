
-- Mejoras de indexación para resolver problemas de rendimiento

-- 1. Índices compuestos para la tabla contacts (alta prioridad - muchos sequential scans)
CREATE INDEX IF NOT EXISTS idx_contacts_created_by_active ON public.contacts(created_by, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_contacts_company_lifecycle ON public.contacts(company_id, lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_status_created ON public.contacts(contact_status, created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_roles_gin ON public.contacts USING GIN(contact_roles);

-- 2. Índices compuestos para la tabla companies (segunda prioridad)
CREATE INDEX IF NOT EXISTS idx_companies_created_by_status ON public.companies(created_by, company_status);
CREATE INDEX IF NOT EXISTS idx_companies_owner_lifecycle ON public.companies(owner_id, lifecycle_stage) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_type_size ON public.companies(company_type, company_size);
CREATE INDEX IF NOT EXISTS idx_companies_industry_revenue ON public.companies(industry, annual_revenue) WHERE annual_revenue IS NOT NULL;

-- 3. Índices para la tabla leads
CREATE INDEX IF NOT EXISTS idx_leads_assigned_status ON public.leads(assigned_to_id, status) WHERE assigned_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_company_priority ON public.leads(company_id, priority) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_score_quality ON public.leads(lead_score, quality);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up_date ON public.leads(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;

-- 4. Índices para optimizar las políticas RLS y consultas de user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_role_composite ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_users ON public.user_roles(role, user_id);

-- 5. Índices parciales para operations (solo operaciones activas y disponibles)
CREATE INDEX IF NOT EXISTS idx_operations_status_active ON public.operations(status, created_at) WHERE status IN ('available', 'active');
CREATE INDEX IF NOT EXISTS idx_operations_created_by_status ON public.operations(created_by, status);

-- 6. Índices para company_enrichments (muchos scans detectados)
CREATE INDEX IF NOT EXISTS idx_company_enrichments_company_source ON public.company_enrichments(company_id, source);
CREATE INDEX IF NOT EXISTS idx_company_enrichments_date_score ON public.company_enrichments(enrichment_date, confidence_score) WHERE confidence_score IS NOT NULL;

-- 7. Índices para opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_stage ON public.opportunities(assigned_to, stage) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_company_status ON public.opportunities(company_id, status) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_opportunities_value_probability ON public.opportunities(value, probability) WHERE value IS NOT NULL;

-- 8. Optimización de la función get_users_with_roles con mejor indexación
-- Crear índice específico para la consulta de usuarios con roles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(id);
CREATE INDEX IF NOT EXISTS idx_operation_managers_user_active ON public.operation_managers(user_id, name) WHERE name IS NOT NULL;

-- 9. Índices para mejorar las consultas de actividades
CREATE INDEX IF NOT EXISTS idx_contact_activities_contact_type_date ON public.contact_activities(contact_id, activity_type, created_at);
CREATE INDEX IF NOT EXISTS idx_company_activities_company_type_date ON public.company_activities(company_id, activity_type, created_at);

-- 10. Actualizar estadísticas de PostgreSQL para mejorar el planificador de consultas
ANALYZE public.contacts;
ANALYZE public.companies;
ANALYZE public.leads;
ANALYZE public.user_roles;
ANALYZE public.operations;
ANALYZE public.company_enrichments;
ANALYZE public.opportunities;
ANALYZE public.user_profiles;

-- 11. Crear función optimizada para obtener usuarios con roles (reemplaza la existente)
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(
  user_id uuid, 
  email text, 
  role app_role, 
  first_name text, 
  last_name text, 
  company text, 
  phone text, 
  is_manager boolean, 
  manager_name text, 
  manager_position text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  WITH user_highest_roles AS (
    SELECT 
      ur.user_id,
      ur.role,
      ROW_NUMBER() OVER (
        PARTITION BY ur.user_id 
        ORDER BY 
          CASE ur.role
            WHEN 'superadmin' THEN 1
            WHEN 'admin' THEN 2
            WHEN 'user' THEN 3
          END
      ) as rn
    FROM user_roles ur
  )
  SELECT 
    u.id as user_id,
    u.email,
    uhr.role,
    up.first_name,
    up.last_name,
    up.company,
    up.phone,
    (om.id IS NOT NULL) as is_manager,
    om.name as manager_name,
    om.position as manager_position
  FROM auth.users u
  LEFT JOIN user_highest_roles uhr ON u.id = uhr.user_id AND uhr.rn = 1
  LEFT JOIN user_profiles up ON u.id = up.id
  LEFT JOIN operation_managers om ON u.id = om.user_id
  WHERE u.email IS NOT NULL
  ORDER BY uhr.role NULLS LAST, u.email;
$$;

-- 12. Configurar autovacuum más agresivo para tablas con alta actividad
ALTER TABLE public.contacts SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.companies SET (autovacuum_vacuum_scale_factor = 0.1);
ALTER TABLE public.contact_activities SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE public.company_activities SET (autovacuum_vacuum_scale_factor = 0.05);
