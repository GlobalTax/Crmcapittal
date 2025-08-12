import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helpers
const normalizeText = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined);
const toNumber = (v: unknown) => {
  if (v === null || v === undefined) return undefined;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[, ]/g, ''));
  return isNaN(n) ? undefined : n;
};
const normalizeCif = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, '').toUpperCase() : undefined);
const slug = (v?: string) =>
  v ? v.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    console.log('lead-webhook: payload received', body);

    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || undefined;
    const ip_address = ipHeader?.split(',')[0]?.trim();
    const user_agent = req.headers.get('user-agent') || undefined;

    // Extract common fields
    const unique_token: string | undefined = normalizeText(body.unique_token) as string | undefined;
    const contact_name = normalizeText(body.contact_name) || normalizeText(body.name);
    const email = normalizeText(body.email);
    const phone = normalizeText(body.phone);
    const company_name = normalizeText(body.company_name);
    const cif = normalizeCif(body.cif);
    const industry = normalizeText(body.industry);
    const location = normalizeText(body.location);
    const employee_range = normalizeText(body.employee_range);
    const years_of_operation = body.years_of_operation != null ? Number(body.years_of_operation) : undefined;
    const revenue = toNumber(body.revenue);
    const ebitda = toNumber(body.ebitda);
    const ownership_participation = normalizeText(body.ownership_participation);
    const competitive_advantage = normalizeText(body.competitive_advantage);
    const created_at_src = normalizeText(body.created_at);

    const final_valuation = toNumber(body.final_valuation);
    const ebitda_multiple_used = toNumber(body.ebitda_multiple_used);
    const valuation_range_min = toNumber(body.valuation_range_min);
    const valuation_range_max = toNumber(body.valuation_range_max);

    const source = normalizeText(body.source) || 'form';
    const utm_source = normalizeText(body.utm_source);
    const utm_medium = normalizeText(body.utm_medium);
    const utm_campaign = normalizeText(body.utm_campaign);
    const utm_term = normalizeText(body.utm_term);
    const utm_content = normalizeText(body.utm_content);
    const referrer = normalizeText(body.referrer || body.referrer_url);

    // 1) Record submission (idempotent by unique_token when present)
    let submissionId: string | undefined;
    let existingProcessed = false;

    if (unique_token) {
      const { data: subUpsert, error: subUpsertErr } = await supabase
        .from('lead_form_submissions')
        .upsert({
          unique_token,
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          referrer,
          ip_address,
          user_agent,
          contact_name,
          company_name,
          cif,
          email,
          phone,
          industry,
          location,
          employee_range,
          years_of_operation,
          revenue,
          ebitda,
          ownership_participation,
          competitive_advantage,
          final_valuation,
          ebitda_multiple_used,
          valuation_range_min,
          valuation_range_max,
          raw_payload: body,
        }, { onConflict: 'unique_token' })
        .select()
        .single();

      if (subUpsertErr) {
        console.error('lead-webhook: submission upsert error', subUpsertErr);
        throw subUpsertErr;
      }

      submissionId = subUpsert?.id;
      existingProcessed = subUpsert?.sync_status === 'processed' && !!subUpsert?.lead_id;
      if (existingProcessed) {
        console.log('lead-webhook: submission already processed, early return', subUpsert);
        return new Response(JSON.stringify({ success: true, message: 'Already processed', lead_id: subUpsert.lead_id, submission_id: subUpsert.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    } else {
      const { data: subInsert, error: subInsertErr } = await supabase
        .from('lead_form_submissions')
        .insert({
          source,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          utm_content,
          referrer,
          ip_address,
          user_agent,
          contact_name,
          company_name,
          cif,
          email,
          phone,
          industry,
          location,
          employee_range,
          years_of_operation,
          revenue,
          ebitda,
          ownership_participation,
          competitive_advantage,
          final_valuation,
          ebitda_multiple_used,
          valuation_range_min,
          valuation_range_max,
          raw_payload: body,
        })
        .select()
        .single();
      if (subInsertErr) {
        console.error('lead-webhook: submission insert error', subInsertErr);
        throw subInsertErr;
      }
      submissionId = subInsert?.id;
    }

    // 2) Dedup find an existing open lead
    let existingLeadId: string | undefined;
    let existingLeadStatus: string | undefined;

    if (unique_token) {
      const { data: leadByToken } = await supabase
        .from('leads')
        .select('id,status')
        .eq('form_data->>unique_token', unique_token)
        .maybeSingle();
      existingLeadId = leadByToken?.id;
      existingLeadStatus = leadByToken?.status as string | undefined;
    }

    if (!existingLeadId && cif) {
      const { data: leadByCif } = await supabase
        .from('leads')
        .select('id,status')
        .eq('extra->>cif', cif)
        .maybeSingle();
      existingLeadId = leadByCif?.id;
      existingLeadStatus = leadByCif?.status as string | undefined;
    }

    if (!existingLeadId && email && company_name) {
      const { data: leadByEmailCompany } = await supabase
        .from('leads')
        .select('id,status')
        .eq('email', email)
        .eq('company_name', company_name)
        .limit(1)
        .maybeSingle();
      existingLeadId = leadByEmailCompany?.id;
      existingLeadStatus = leadByEmailCompany?.status as string | undefined;
    }

    if (!existingLeadId && email) {
      const { data: leadByEmail } = await supabase
        .from('leads')
        .select('id,status')
        .eq('email', email)
        .limit(1)
        .maybeSingle();
      existingLeadId = leadByEmail?.id;
      existingLeadStatus = leadByEmail?.status as string | undefined;
    }

    const nowIso = new Date().toISOString();

    // 3) Prepare lead payload
    const leadPayloadBase: Record<string, unknown> = {
      name: contact_name,
      email,
      phone,
      company_name,
      source: source === 'form' ? 'webform' : source, // map basic source
      lead_origin: 'webform',
      service_type: 'valoracion_empresa',
      status: 'NEW',
      stage: 'pipeline',
      probability: 5,
      valor_estimado: final_valuation,
      deal_value: final_valuation,
      source_detail: industry || source,
      last_contacted: created_at_src || nowIso,
      form_data: {
        ip_address,
        user_agent,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        referrer,
        unique_token,
        revenue,
        ebitda,
        ownership_participation,
        competitive_advantage,
        raw_payload: body,
      },
      extra: {
        cif,
        employee_range,
        years_of_operation,
        location,
        ebitda_multiple_used,
        valuation_range_min,
        valuation_range_max,
      },
    };

    let leadId: string | undefined;
    let operation: 'created' | 'updated' = 'created';

    const isClosed = (s?: string) => s === 'CONVERTED' || s === 'LOST';

    if (existingLeadId && !isClosed(existingLeadStatus)) {
      const { data: updated, error: updErr } = await supabase
        .from('leads')
        .update(leadPayloadBase)
        .eq('id', existingLeadId)
        .select('id')
        .single();
      if (updErr) {
        console.error('lead-webhook: lead update error', updErr);
        throw updErr;
      }
      leadId = updated?.id;
      operation = 'updated';
    } else {
      const { data: inserted, error: insErr } = await supabase
        .from('leads')
        .insert(leadPayloadBase)
        .select('id')
        .single();
      if (insErr) {
        console.error('lead-webhook: lead insert error', insErr);
        throw insErr;
      }
      leadId = inserted?.id;
      operation = 'created';
    }

    // 4) Tagging
    if (leadId) {
      const tags: Array<{ lead_id: string; tag: string; source: string }> = [];
      tags.push({ lead_id: leadId, tag: 'form', source: 'lead-webhook' });
      const srcSlug = slug(source);
      if (srcSlug && srcSlug !== 'form') tags.push({ lead_id: leadId, tag: srcSlug, source: 'lead-webhook' });
      const indSlug = slug(industry || undefined);
      if (indSlug) tags.push({ lead_id: leadId, tag: indSlug, source: 'lead-webhook' });

      const { error: tagErr } = await supabase
        .from('lead_tags')
        .upsert(tags, { onConflict: 'lead_id,tag', ignoreDuplicates: true });
      if (tagErr) console.error('lead-webhook: tag upsert error (non-fatal)', tagErr);
    }

    // 5) Mark submission as processed
    if (submissionId && leadId) {
      const { error: subUpdErr } = await supabase
        .from('lead_form_submissions')
        .update({ lead_id: leadId, sync_status: 'processed', processed_at: nowIso, sync_error: null })
        .eq('id', submissionId);
      if (subUpdErr) console.error('lead-webhook: submission update error (non-fatal)', subUpdErr);
    }

    const res = { success: true, message: `Lead ${operation}`, lead_id: leadId, submission_id: submissionId };
    console.log('lead-webhook: success', res);
    return new Response(JSON.stringify(res), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error in lead-webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: error?.message || 'unknown_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});