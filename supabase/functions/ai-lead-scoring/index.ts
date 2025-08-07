import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InputLead {
  id: string;
  industry?: string | null;
  company_size?: string | null;
  budget?: number | string | null;
  timeline?: string | null;
  engagement?: number | string | null;
  description?: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leads } = await req.json();
    if (!Array.isArray(leads)) {
      return new Response(JSON.stringify({ error: 'Invalid payload: leads[] required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const today = new Date().toISOString();

    // Build a compact prompt with strict JSON output
    const prompt = `Eres un analista senior de M&A. Puntúa cada lead de 0 a 100 y da 3-5 razones en español.
Devuelve SOLO JSON con este esquema:
{
  "results": [
    {"id":"string","aiScore":number,"scoreReasons":["..."],"temperature":"hot|warm|cold"}
  ]
}

Criterios (ponderación orientativa):
- Encaje sectorial/industria y tamaño (25%)
- Presupuesto/EV aproximado y timeline (35%)
- Engagement y señales recientes (25%)
- Señales cualitativas del texto (15%)

Umbrales: hot ≥ 80, warm 50-79, cold < 50.
`;

    const items = (leads as InputLead[]).map(l => ({
      id: l.id,
      industry: l.industry ?? '',
      company_size: l.company_size ?? '',
      budget: typeof l.budget === 'number' ? l.budget : (l.budget ?? ''),
      timeline: l.timeline ?? '',
      engagement: typeof l.engagement === 'number' ? l.engagement : (l.engagement ?? ''),
      description: l.description ?? ''
    }));

    const messages = [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify({ leads: items }) }
    ];

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      return new Response(JSON.stringify({ error: 'OpenAI error', details: err }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';

    let parsed: any = {};
    try {
      parsed = JSON.parse(content);
    } catch (_) {
      parsed = { results: [] };
    }

    // Normalize and enforce thresholds server-side
    const results = Array.isArray(parsed.results) ? parsed.results : [];
    const normalized = results.map((r: any) => {
      const score = Math.max(0, Math.min(100, Number(r.aiScore ?? 0)));
      const temperature = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';
      return {
        id: String(r.id),
        aiScore: score,
        temperature,
        scoreReasons: Array.isArray(r.scoreReasons) ? r.scoreReasons.map(String) : [],
        lastScored: today,
      };
    });

    return new Response(JSON.stringify({ results: normalized }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ai-lead-scoring error', error);
    return new Response(JSON.stringify({ error: 'Unexpected error', details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
