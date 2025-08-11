import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacSHA256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const secret = Deno.env.get("CRM_INGEST_SECRET");
  if (!secret) {
    console.error("CRM_INGEST_SECRET is not set");
    return new Response(JSON.stringify({ error: "misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let rawBody = "";
  try {
    rawBody = await req.text();
  } catch (e) {
    console.error("Failed to read request body", e);
    return new Response(JSON.stringify({ error: "invalid_body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Signature validation
  const signature = req.headers.get("x-signature") || "";
  try {
    const computed = await hmacSHA256Hex(secret, rawBody);
    if (!signature || !timingSafeEqual(signature, computed)) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("Signature validation error", e);
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse JSON after signature verification
  let body: any;
  try {
    body = rawBody ? JSON.parse(rawBody) : {};
  } catch (e) {
    console.error("JSON parse error", e);
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Inicializar Supabase
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Soporte para payloads con { type, data }
  const incomingType: string | undefined = body?.type;
  if (incomingType) {
    const data = body?.data ?? {};

    if (incomingType === "valuation_pdf") {
      const pdfUrl: string | undefined = data?.pdf_url;
      if (!pdfUrl) {
        return new Response(
          JSON.stringify({ success: false, error: "Falta pdf_url" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Descargar PDF
      const resp = await fetch(pdfUrl);
      if (!resp.ok) {
        const bodyTxt = await resp.text();
        return new Response(
          JSON.stringify({ success: false, error: `No se pudo descargar el PDF: ${resp.status}` , details: bodyTxt }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const arrayBuf = await resp.arrayBuffer();

      // Nombre destino
      const url = new URL(pdfUrl);
      const originalName = url.pathname.split("/").pop() || `valuation-${Date.now()}.pdf`;
      const targetPath = `ingested/${new Date().getFullYear()}/${originalName}`;

      // Subir a Storage (bucket público 'valuations')
      const upload = await supabase.storage
        .from("valuations")
        .upload(targetPath, new Uint8Array(arrayBuf), {
          contentType: "application/pdf",
          upsert: true,
        });
      if (upload.error) {
        return new Response(
          JSON.stringify({ success: false, error: upload.error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { data: pub } = supabase.storage.from("valuations").getPublicUrl(targetPath);
      const destPdfUrl = pub.publicUrl;

      const inserted = await supabase
        .from("lead_valuations")
        .insert({
          source: data?.source || "sync-leads",
          pdf_url: destPdfUrl,
          company: data?.company ?? null,
          result: data?.result ?? null,
          tags: data?.tags ?? null,
        })
        .select("id")
        .maybeSingle();

      if (inserted.error) {
        return new Response(
          JSON.stringify({ success: false, error: inserted.error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(
        JSON.stringify({ success: true, id: inserted.data?.id, pdfUrl: destPdfUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Cualquier otro tipo -> tabla genérica crm_leads
    const common = {
      lead_type: incomingType,
      full_name: data?.full_name || data?.contact_name || data?.user_name || null,
      email: data?.email || data?.user_email || null,
      phone: data?.phone || data?.user_phone || null,
      company: data?.company || data?.company_name || data?.user_company || null,
      status: data?.status || (incomingType === "collaborator" ? "pending" : "new"),
      source: data?.source || "capittal_website",
      payload: data || {},
    } as const;

    const ins = await supabase.from("crm_leads").insert(common).select("id").maybeSingle();
    if (ins.error) {
      return new Response(
        JSON.stringify({ success: false, error: ins.error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: ins.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Flujo anterior: requiere intent = sell|buy
  const intent = body?.intent;
  if (intent !== "sell" && intent !== "buy") {
    return new Response(JSON.stringify({ error: "invalid_intent" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = (body?.contact?.email || "").toLowerCase();
  const companyNameRaw = body?.contact?.company || body?.company?.name || null;
  const visitorId = body?.visitor_id || "";
  const dedupeKey = [email, (companyNameRaw || "").toLowerCase(), visitorId].filter(Boolean).join("|") || crypto.randomUUID();
  const defaultOwnerId = Deno.env.get("DEFAULT_LEAD_OWNER_ID") || null;

  // Map fields
  const insertObj = {
    intent: body.intent,
    contact_name: body?.contact?.name ?? null,
    email: body?.contact?.email ?? null,
    phone: body?.contact?.phone ?? null,
    company_name: body?.contact?.company ?? null,
    cif: body?.contact?.cif ?? null,
    industry: body?.company?.industry ?? null,
    years_of_operation: body?.company?.years_of_operation ?? null,
    employee_range: body?.company?.employee_range ?? null,
    location: body?.company?.location ?? null,
    revenue: body?.company?.revenue ?? null,
    ebitda: body?.company?.ebitda ?? null,
    final_valuation: body?.calc_summary?.final_valuation ?? null,
    valuation_range_min: body?.calc_summary?.valuation_range?.min ?? null,
    valuation_range_max: body?.calc_summary?.valuation_range?.max ?? null,
    ebitda_multiple_used: body?.calc_summary?.ebitda_multiple_used ?? null,
    utm: body?.utm ?? null,
    visitor_id: body?.visitor_id ?? null,
    source: body?.source ?? "capittal",
    payload: body,
    dedupe_key: dedupeKey,
    processing_status: defaultOwnerId ? "processing" : "queued_missing_owner",
  } as Record<string, unknown>;

  try {
    const { data: inbound, error: insertError } = await supabase
      .from("crm_inbound_leads")
      .insert(insertObj)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error", insertError);
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let companyId: string | null = null;
    let contactId: string | null = null;
    let leadId: string | null = null;

    if (defaultOwnerId) {
      // Upsert company
      if (companyNameRaw) {
        // by NIF first if provided
        if (body?.contact?.cif) {
          const { data: byNif } = await supabase
            .from("companies")
            .select("id")
            .eq("nif", body.contact.cif)
            .maybeSingle();
          if (byNif?.id) companyId = byNif.id;
        }
        if (!companyId) {
          const { data: byName } = await supabase
            .from("companies")
            .select("id")
            .ilike("name", companyNameRaw)
            .maybeSingle();
          if (byName?.id) companyId = byName.id;
        }
        if (!companyId) {
          const { data: newCo, error: coErr } = await supabase
            .from("companies")
            .insert({
              name: companyNameRaw,
              website: body?.company?.website ?? null,
              industry: body?.company?.industry ?? null,
              address: body?.company?.location ?? null,
              created_by: defaultOwnerId,
              source_table: "crm_inbound_leads",
              external_id: inbound.id,
            })
            .select("id")
            .single();
          if (coErr) throw coErr;
          companyId = newCo.id;
        }
      }

      // Upsert contact
      if (email) {
        const { data: existingContact } = await supabase
          .from("contacts")
          .select("id")
          .eq("email", email)
          .maybeSingle();
        if (existingContact?.id) {
          contactId = existingContact.id;
        } else {
          const { data: newCt, error: ctErr } = await supabase
            .from("contacts")
            .insert({
              name: body?.contact?.name || companyNameRaw || email,
              email,
              phone: body?.contact?.phone ?? null,
              company_id: companyId,
              contact_type: "other",
              contact_status: "active",
              created_by: defaultOwnerId,
              source_table: "crm_inbound_leads",
              external_id: inbound.id,
            })
            .select("id")
            .single();
          if (ctErr) throw ctErr;
          contactId = newCt.id;
        }
      }

      // Create lead (requires assigned_to_id and created_by)
      if (email && defaultOwnerId) {
        const { data: newLead, error: leadErr } = await supabase
          .from("leads")
          .insert({
            name: body?.contact?.name || companyNameRaw || email,
            email,
            source: body?.source || "capittal",
            lead_origin: "webform",
            assigned_to_id: defaultOwnerId,
            created_by: defaultOwnerId,
            company_id: companyId,
            contact_id: contactId,
          })
          .select("id")
          .single();
        if (leadErr) throw leadErr;
        leadId = newLead.id;
      }

      // Update inbound with results
      await supabase
        .from("crm_inbound_leads")
        .update({
          processing_status: "processed",
          processed_at: new Date().toISOString(),
          company_id: companyId,
          contact_id: contactId,
          lead_id: leadId,
        })
        .eq("id", inbound.id);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id: inbound.id,
        created: Boolean(leadId),
        message: defaultOwnerId
          ? "Lead procesado"
          : "Registrado, pendiente de DEFAULT_LEAD_OWNER_ID",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Unexpected error", e);
    // best-effort log to inbound row if we had one
    try {
      // dedupe_key exists; update last inserted by dedupe_key
      await supabase
        .from("crm_inbound_leads")
        .update({
          processing_status: "error",
          processing_error: (e as any)?.message || String(e),
          processed_at: new Date().toISOString(),
        })
        .eq("dedupe_key", dedupeKey);
    } catch (_e) {}
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
