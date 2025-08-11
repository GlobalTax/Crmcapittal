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

  // Basic validation
  const intent = body?.intent;
  if (intent !== "sell" && intent !== "buy") {
    return new Response(JSON.stringify({ error: "invalid_intent" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    source: body?.source ?? null,
    payload: body,
    // submitted_at is not stored as a column in the spec; we keep it in payload
  } as Record<string, unknown>;

  try {
    const { data, error } = await supabase
      .from("crm_inbound_leads")
      .insert(insertObj)
      .select("id")
      .single();

    if (error) {
      console.error("Insert error", error);
      return new Response(JSON.stringify({ error: "insert_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Unexpected error", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
