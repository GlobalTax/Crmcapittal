-- Función y trigger: coherencia prob_conversion / status en leads
-- Idempotente y RLS-friendly. No modifica permisos; sólo normaliza datos.

-- 1) Función trigger
create or replace function public.enforce_lead_prob_status()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
  -- Umbrales mínimos recomendados
  min_qualified integer := 60;
  min_converted integer := 90;
  -- Toggle opcional: auto-promoción basada en probabilidad
  auto_promote boolean := false;
  v_guc text;
begin
  -- Leer configuración opcional desde GUC: SET app.leads.auto_promote = 'true';
  begin
    v_guc := current_setting('app.leads.auto_promote', true);
    if v_guc is not null and length(v_guc) > 0 then
      auto_promote := (lower(v_guc) in ('true','on','1','yes'));
    end if;
  exception when others then
    auto_promote := false; -- por defecto desactivado si no existe GUC
  end;

  -- A) Reglas al cambiar de estado
  if NEW.status is distinct from OLD.status then
    -- Normalizamos comparaciones en mayúsculas para evitar discrepancias
    if upper(NEW.status::text) = 'QUALIFIED' then
      if NEW.prob_conversion is null or NEW.prob_conversion < min_qualified then
        NEW.prob_conversion := min_qualified;
      end if;
    elsif upper(NEW.status::text) = 'CONVERTED' then
      if NEW.prob_conversion is null or NEW.prob_conversion < min_converted then
        NEW.prob_conversion := min_converted;
      end if;
      if NEW.won_date is null then
        NEW.won_date := now();
      end if;
    elsif upper(NEW.status::text) in ('LOST','DISQUALIFIED') then
      if NEW.lost_date is null then
        NEW.lost_date := now();
      end if;
      -- Mantener lost_reason si lo envían; no forzar aquí para no romper UI
    end if;
  end if;

  -- B) Auto-promoción opcional desde CONTACTED si prob > 80
  if auto_promote
     and upper(coalesce(NEW.status::text,'')) = 'CONTACTED'
     and NEW.prob_conversion is not null
     and NEW.prob_conversion > 80 then
    -- Proponer salto automático: aplicamos cambio directo si está habilitado
    NEW.status := 'QUALIFIED';
    if NEW.prob_conversion < min_qualified then
      NEW.prob_conversion := min_qualified;
    end if;
  end if;

  return NEW;
end;
$$;

comment on function public.enforce_lead_prob_status() is
  'Trigger BEFORE UPDATE para public.leads: asegura mínimos de prob_conversion según status, setea won_date/lost_date al convertir o perder, y puede auto-promover de CONTACTED a QUALIFIED si app.leads.auto_promote=true.';

-- 2) Trigger en tabla leads
DROP TRIGGER IF EXISTS trg_enforce_lead_prob_status ON public.leads;
CREATE TRIGGER trg_enforce_lead_prob_status
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.enforce_lead_prob_status();

-- ===============================
-- PRUEBAS (comentadas)
-- ===============================
-- -- A) Cambio a QUALIFIED eleva prob_conversion a >=60
-- update public.leads set status='QUALIFIED', prob_conversion=40 where id='<LEAD_UUID>'::uuid;
-- select status, prob_conversion from public.leads where id='<LEAD_UUID>'::uuid;
-- -- Esperado: prob_conversion >= 60
--
-- -- B) Cambio a CONVERTED eleva prob_conversion a >=90 y fija won_date si nulo
-- update public.leads set status='CONVERTED', prob_conversion=75, won_date=null where id='<LEAD_UUID>'::uuid;
-- select status, prob_conversion, won_date from public.leads where id='<LEAD_UUID>'::uuid;
-- -- Esperado: prob_conversion >= 90, won_date not null
--
-- -- C) Cambio a LOST/ DISQUALIFIED fija lost_date si nulo
-- update public.leads set status='LOST', lost_date=null where id='<LEAD_UUID>'::uuid;
-- select status, lost_date from public.leads where id='<LEAD_UUID>'::uuid;
-- -- Esperado: lost_date not null
--
-- -- D) Auto-promoción desde CONTACTED si prob>80 con GUC activado
-- select set_config('app.leads.auto_promote', 'true', true);
-- update public.leads set status='CONTACTED', prob_conversion=85 where id='<LEAD_UUID>'::uuid;
-- select status, prob_conversion from public.leads where id='<LEAD_UUID>'::uuid;
-- -- Esperado: status='QUALIFIED', prob_conversion >= 60
