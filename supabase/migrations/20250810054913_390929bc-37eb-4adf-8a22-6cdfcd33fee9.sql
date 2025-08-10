-- RPC: assign_lead(p_lead_id uuid, p_user_id uuid)
-- Objetivo: asignar un lead de forma segura verificando permisos y registrando actividad/auditoría
-- Idempotente: CREATE OR REPLACE FUNCTION; uso de to_regclass para tablas opcionales
-- Seguridad: SECURITY DEFINER y search_path limitado a 'public'

create or replace function public.assign_lead(
  p_lead_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_lead record;
  v_prev_assignee uuid;
  v_caller uuid := auth.uid();
  v_allowed boolean := false;
  v_user_email text;
begin
  -- 1) Validación de existencia del lead
  select id, created_by, assigned_to_id
    into v_lead
  from public.leads
  where id = p_lead_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Lead no encontrado');
  end if;

  v_prev_assignee := v_lead.assigned_to_id;

  -- 2) Comprobaciones de permiso mínimas (RLS-friendly)
  -- 2.1 Propietario o asignado actual
  if v_lead.created_by = v_caller or v_prev_assignee = v_caller then
    v_allowed := true;
  end if;

  -- 2.2 Roles elevados (admin/superadmin) usando has_role_secure si existe
  if not v_allowed then
    begin
      if has_role_secure(v_caller, 'admin'::app_role)
         or has_role_secure(v_caller, 'superadmin'::app_role) then
        v_allowed := true;
      end if;
    exception when undefined_function then
      -- Si no existe has_role_secure, continuamos sin error
      null;
    end;
  end if;

  -- 2.3 Permisos granulares vía tabla (opcional) si existe user_permissions
  if not v_allowed and to_regclass('public.user_permissions') is not null then
    if exists (
      select 1
      from public.user_permissions up
      where up.user_id = v_caller
        and coalesce(up.is_granted, true) = true
        and up.permission_key in ('leads.assign', 'leads.manage_all')
    ) then
      v_allowed := true;
    end if;
  end if;

  if not v_allowed then
    return jsonb_build_object('success', false, 'error', 'Permisos insuficientes para asignar lead');
  end if;

  -- 3) Actualización de la asignación (bypass RLS por SECURITY DEFINER, con chequeos previos)
  update public.leads
     set assigned_to_id = p_user_id,
         updated_at = now()
   where id = p_lead_id;

  -- 4) Registro de actividad si existe lead_activities; si no, escribir en audit_trail
  if to_regclass('public.lead_activities') is not null then
    insert into public.lead_activities(lead_id, description, created_at)
    values (p_lead_id, format('Lead asignado a %s', p_user_id::text), now());
  else
    -- Fallback a auditoría estándar
    select email into v_user_email from auth.users where id = v_caller;
    insert into public.audit_trail (
      table_name, operation, user_id, user_email, new_data, old_data
    ) values (
      'leads', 'ASSIGN', v_caller, v_user_email,
      jsonb_build_object('lead_id', p_lead_id, 'new_assigned_to_id', p_user_id),
      jsonb_build_object('lead_id', p_lead_id, 'previous_assigned_to_id', v_prev_assignee)
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'message', 'Lead asignado correctamente',
    'lead_id', p_lead_id,
    'assigned_to_id', p_user_id
  );
end;
$$;

comment on function public.assign_lead(uuid, uuid) is
  'Asigna un lead a un usuario de forma segura. Checks: owner/asignee actual o permisos (roles admin/superadmin o user_permissions.leads.assign/manage_all si existe). Registra actividad en lead_activities si existe o en audit_trail.';

-- ===============================
-- PRUEBAS (comentadas) 
-- ===============================
-- NOTA: Para simular auth.uid() en entorno SQL, usar el patrón set_config de Supabase:
-- select set_config('request.jwt.claims', json_build_object('sub', '<UUID_USUARIO>')::text, true);
--
-- 1) Éxito (propietario o asignado actual):
--   select set_config('request.jwt.claims', json_build_object('sub', '<OWNER_OR_ASSIGNEE_UUID>')::text, true);
--   select public.assign_lead('<LEAD_UUID>'::uuid, '<NEW_ASSIGNEE_UUID>'::uuid);
--
-- 2) Permiso denegado:
--   select set_config('request.jwt.claims', json_build_object('sub', '<OTHER_USER_UUID>')::text, true);
--   select public.assign_lead('<LEAD_UUID>'::uuid, '<NEW_ASSIGNEE_UUID>'::uuid);
--   -- Esperado: {"success": false, "error": "Permisos insuficientes..."}
--
-- 3) Lead inexistente:
--   select public.assign_lead('00000000-0000-0000-0000-000000000000'::uuid, '<ANY_USER_UUID>'::uuid);
--   -- Esperado: {"success": false, "error": "Lead no encontrado"}

-- ROLLBACK (manual si fuese necesario):
--   drop function if exists public.assign_lead(uuid, uuid);
