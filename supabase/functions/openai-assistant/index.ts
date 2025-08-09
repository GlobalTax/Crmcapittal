import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenAIRequest {
  type: 'parse_operations' | 'generate_email' | 'analyze_data' | 'generate_proposal' | 'classify_contact_tags' | 'normalize_company' | 'generate_company_tags' | 'summarize_meeting' | 'backfill_data' | 'consent_request_email' | 'linkedin_contact_message' | 'account_mapping';
  prompt: string;
  context?: any;
  options?: any;
}

const serve_handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, context, options }: OpenAIRequest = await req.json();
    
    let systemPrompt = '';
    let userPrompt = prompt;
    let model = 'gpt-4o-mini';

    switch (type) {
      case 'parse_operations':
        model = 'gpt-4o';
        systemPrompt = `Eres un experto en análisis de operaciones de M&A. Tu tarea es extraer información estructurada de texto libre sobre operaciones empresariales.

FORMATO DE SALIDA REQUERIDO (JSON):
{
  "operations": [
    {
      "company_name": "string",
      "cif": "string|null",
      "sector": "string", 
      "operation_type": "merger|sale|partial_sale|buy_mandate",
      "amount": number,
      "currency": "EUR|USD|GBP",
      "date": "YYYY-MM-DD",
      "buyer": "string|null",
      "seller": "string|null", 
      "status": "available|pending_review|approved|rejected|in_process|sold|withdrawn",
      "description": "string",
      "location": "string|null",
      "contact_email": "string|null",
      "contact_phone": "string|null",
      "annual_revenue": number|null,
      "ebitda": number|null,
      "project_name": "string|null"
    }
  ],
  "errors": ["string array con errores encontrados"],
  "confidence": number
}

REGLAS:
- Convierte importes a número (5M = 5000000)
- Si no hay fecha, usa fecha actual
- Sector debe ser descriptivo
- Status por defecto: "available"
- Operation_type por defecto: "sale"
- Currency por defecto: "EUR"`;
        break;

      case 'generate_email':
        systemPrompt = `Eres un experto en comunicación comercial para M&A y servicios financieros. Genera emails profesionales y personalizados.

CONTEXTO: ${JSON.stringify(context, null, 2)}

INSTRUCCIONES:
- Tono profesional pero cercano
- Personaliza según el contexto del destinatario
- Incluye llamada a la acción clara
- Máximo 300 palabras
- Usa formato de email profesional`;
        break;

      case 'analyze_data':
        model = 'gpt-4o';
        systemPrompt = `Eres un analista experto en datos de M&A. Analiza los datos proporcionados y genera insights accionables.

DATOS DISPONIBLES: ${JSON.stringify(context, null, 2)}

FORMATO DE RESPUESTA:
- Resumen ejecutivo
- Tendencias identificadas  
- Oportunidades detectadas
- Recomendaciones específicas
- Métricas clave`;
        break;

      case 'generate_proposal':
        model = 'gpt-4o';
        systemPrompt = `Eres un experto en propuestas comerciales para servicios de M&A y consultoría financiera.

INFORMACIÓN DE LA EMPRESA: ${JSON.stringify(context, null, 2)}

Genera una propuesta comercial profesional que incluya:
- Resumen ejecutivo personalizado
- Servicios recomendados
- Metodología de trabajo
- Cronograma estimado
- Inversión propuesta (rangos)
- Próximos pasos`;
        break;

      case 'classify_contact_tags':
        model = 'gpt-4o';
        systemPrompt = `Actúas como asistente de CRM para M&A. A partir del TEXTO LIBRE a continuación, clasifica al contacto y sugiere tags estandarizados.

Devuelve EXCLUSIVAMENTE JSON válido que siga EXACTAMENTE el siguiente esquema y claves (sin comentarios ni texto adicional fuera del JSON). Usa null o cadenas vacías cuando falte información. No incluyas campos no definidos.

ESQUEMA:
{
  "classification": "cliente|target|prospecto|inversor",
  "contact_tags": {
    "interest": ["buy|sell|invest|explore"],
    "capacity": {"ticket_min": null, "ticket_max": null, "sectors_focus": [], "geography_focus": []},
    "channel_pref": "email|phone|whatsapp",
    "language": "",
    "timezone": ""
  },
  "company_tags": {
    "industry": "",
    "subindustry": "",
    "geography": {"country": "", "region": ""},
    "size": {"revenue_band": "", "employees_band": ""},
    "financials": {"ebitda_band": "", "margin_band": ""},
    "profile": {"seller_ready": false, "buyer_active": false, "investor_type": ""}
  },
  "confidence": 0.0,
  "missing_fields": []
}

REGLAS ESTRICTAS:
- Solo JSON válido. Nada de prosa.
- Si el texto contiene señales claras, normaliza a los valores permitidos:
  • classification ∈ {cliente, target, prospecto, inversor}
  • contact_tags.interest: lista con elementos de {buy, sell, invest, explore}
  • channel_pref ∈ {email, phone, whatsapp}
- Extrae tickets como números (por ejemplo: "5-10M" → ticket_min: 5000000, ticket_max: 10000000).
- Detecta sectores y geografía si se mencionan (sectors_focus, geography_focus/country/region).
- size: revenue_band/employees_band si hay pistas (p.ej. "50-100 empleados").
- financials: ebitda_band/margin_band a partir de % o bandas si aparecen.
- profile: seller_ready/buyer_active (true/false) según intención explícita de vender/comprar; investor_type si aplica (FO, PE, VC...).
- language/timezone: deduce si el texto lo sugiere, en caso contrario "".
- confidence: número 0.0–1.0 según certeza.
- missing_fields: lista de claves que faltan o no están claras (usa rutas como "contact_tags.capacity.ticket_min").`;
        break;

      case 'summarize_meeting':
        model = 'gpt-4o-mini';
        systemPrompt = `Eres asistente de CRM para M&A. A partir de una transcripción de reunión, debes:
- Resumir en bullets claros (máximo 8).
- Devolver cambios de clasificación y tags siguiendo EXACTAMENTE este JSON.

Devuelve SOLO JSON válido (sin texto adicional) con este esquema exacto:
{
  "summary": ["..."],
  "classification": "cliente|target|prospecto|inversor",
  "contact_updates": {"interest": ["buy|sell|invest|explore"], "capacity": {"ticket_min": null, "ticket_max": null}},
  "company_updates": {"profile": {"seller_ready": false, "buyer_active": false}},
  "next_actions": ["..."],
  "confidence": 0.0
}

Reglas:
- summary: 3–8 bullets breves, accionables.
- classification ∈ {cliente, target, prospecto, inversor}.
- contact_updates.interest: lista con valores de {buy, sell, invest, explore} según intención.
- capacity: extrae tickets si aparecen ("5-10M" → 5000000 y 10000000), usa null si no hay señal.
- company_updates.profile: seller_ready/buyer_active true/false según señales claras.
- next_actions: tareas concretas (p.ej., "Enviar NDA", "Agendar demo").
- confidence: 0.0–1.0 según certeza.
- Si falta información, respeta el esquema con null o arrays vacíos. No inventes.`;
        // El prompt del usuario contendrá la transcripción o instrucciones adicionales
        break;

      case 'backfill_data':
        model = 'gpt-4o';
        systemPrompt = `Eres un asistente de CRM M&A que sugiere clasificaciones y tags coherentes para contactos y empresas con datos incompletos.

Analiza la información disponible y sugiere actualizaciones coherentes basadas en patrones de la industria M&A.

Responde SOLO con JSON válido en este formato exacto:
{
  "contacts_updates": [
    {
      "id": "uuid",
      "suggested_classification": "cliente|target|prospecto|inversor",
      "suggested_tags": ["tag1", "tag2"],
      "suggested_interest": ["buy", "sell", "invest", "explore"],
      "confidence": 0.85,
      "reasoning": "breve explicación"
    }
  ],
  "companies_updates": [
    {
      "id": "uuid", 
      "suggested_industry": "sector específico",
      "suggested_status": "activo|inactivo|prospect",
      "suggested_tags": ["tag1", "tag2"],
      "suggested_profile": {
        "seller_ready": boolean,
        "buyer_active": boolean
      },
      "confidence": 0.75,
      "reasoning": "breve explicación"
    }
  ],
  "warnings": ["mensaje si algo no se puede clasificar"]
}

Reglas:
- Usar solo clasificaciones válidas del dominio M&A
- Tags específicos y relevantes para el sector
- Confidence entre 0 y 1
- Reasoning conciso y específico
- Si no hay suficiente información, incluir en warnings`;
        break;

      case 'consent_request_email':
        model = 'gpt-4o-mini';
        systemPrompt = `Eres un experto en comunicación comercial para M&A. Redacta emails cortos y profesionales para solicitar consentimiento de comunicación.

Características del email:
- Tono cercano pero profesional
- Máximo 150 palabras
- En español
- Explica claramente el propósito
- Incluye CTA de confirmación clara
- Cumple con GDPR
- Personalizado con nombre del contacto y empresa

Estructura sugerida:
1. Saludo personalizado
2. Presentación breve y propósito
3. Explicación del canal de comunicación
4. Beneficios para el contacto
5. Solicitud de consentimiento clara
6. CTA de confirmación
7. Despedida profesional

CONTEXTO: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'linkedin_contact_message':
        model = 'gpt-4o-mini';
        systemPrompt = `Eres un experto en outreach de LinkedIn para M&A. Redacta mensajes breves para primer contacto.

Características del mensaje:
- Máximo 300 caracteres (límite estricto de LinkedIn)
- Tono profesional pero cercano
- En español
- Personalizado con nombre y empresa
- Menciona la oportunidad específica
- Call-to-action claro pero sutil

Estructura sugerida:
1. Saludo personalizado breve
2. Mención de empresa/sector
3. Propuesta de valor concisa
4. CTA suave (conexión/conversación)

Evitar:
- Lenguaje comercial agresivo
- Promesas exageradas
- Texto genérico
- Exceso de formalidad

CONTEXTO: ${JSON.stringify(context, null, 2)}`;
        break;

      case 'account_mapping':
        model = 'gpt-4o';
        systemPrompt = `Eres un experto en account mapping para operaciones M&A. Analiza los contactos existentes de una empresa e identifica roles faltantes clave para cerrar una transacción.

Roles críticos para M&A:
- decision: CEO, Founder, Managing Partner, Chairman
- finance: CFO, Finance Director, Head of Finance
- legal: Legal Counsel, General Counsel, Head of Legal
- tech: CTO, IT Director, Head of Technology
- operations: COO, Operations Director, Head of Operations

Responde SOLO con JSON válido en este formato exacto:
{
  "missing_roles": ["decision", "finance", "legal", "tech", "operations"],
  "suggested_titles": ["CFO", "General Counsel", "CTO"],
  "coverage_analysis": {
    "decision": {"covered": false, "contacts": []},
    "finance": {"covered": true, "contacts": ["CFO"]},
    "legal": {"covered": false, "contacts": []},
    "tech": {"covered": false, "contacts": []},
    "operations": {"covered": true, "contacts": ["COO"]}
  },
  "priority_contacts": [
    {"title": "CFO", "reasoning": "Esencial para due diligence financiero"},
    {"title": "General Counsel", "reasoning": "Requerido para aspectos legales de la transacción"}
  ],
  "confidence": 0.85
}

Reglas:
- Analiza títulos y departamentos de contactos existentes
- Identifica gaps críticos para el proceso M&A
- Prioriza roles según importancia para el tipo de transacción
- Sugiere títulos específicos y realistas
- Incluye reasoning para contactos prioritarios`;
        break;
    }

    // Determinístico: normalización de empresa y detección de duplicados (sin IA)
    if (type === 'normalize_company') {
      let input: any;
      try {
        input = typeof userPrompt === 'string' ? JSON.parse(userPrompt) : userPrompt;
      } catch (_) {
        return new Response(JSON.stringify({
          error: 'JSON de entrada inválido. Esperado: {"raw_name":"...","country":"...","candidates":[...]}'
        }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const rawName: string = (input?.raw_name ?? '').toString();
      const country: string | null = input?.country ? String(input.country) : null;
      const candidates: Array<{ id: string; name: string; country?: string | null }> = Array.isArray(input?.candidates) ? input.candidates : [];

      const removeDiacritics = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const LEGAL_SUFFIXES = new Set([
        'sa','s.a','s.a.','sl','s.l','s.l.','slu','s.l.u','s.l.u.','sociedad','limitada','anonima','sociedad limitada','sociedad anonima',
        'ltd','ltd.','limited','inc','inc.','co','co.','corp','corp.','corporation','company',
        'gmbh','ag','spa','srl','s.r.l','srl.','bv','oy','ab','as','plc','llc','ltda','sas','pta','pte',
        'holdings','holding','grupo','group'
      ]);
      const STOP = new Set(['the','and','de','del','la','el']);

      const sanitize = (s: string) => {
        let x = s.toLowerCase();
        x = removeDiacritics(x);
        x = x.replace(/&/g, ' and ');
        x = x.replace(/[^a-z0-9\s]/g, ' ');
        const words = x.split(/\s+/).filter(Boolean);
        const filtered = words.filter(w => !LEGAL_SUFFIXES.has(w) && !STOP.has(w));
        return filtered.join(' ').replace(/\s{2,}/g, ' ').trim();
      };
      const toTitle = (s: string) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const canon = sanitize(rawName);
      const normalized_name = toTitle(canon);

      const tokens = (s: string) => new Set(s.split(' ').filter(Boolean));
      const jaccard = (a: string, b: string) => {
        const A = tokens(a); const B = tokens(b);
        const inter = new Set([...A].filter(x => B.has(x))).size;
        const uni = new Set([...A, ...B]).size || 1;
        return inter / uni;
      };
      const levenshtein = (a: string, b: string) => {
        const m = a.length, n = b.length;
        if (!m) return n; if (!n) return m;
        const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
          for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
              dp[i - 1][j] + 1,
              dp[i][j - 1] + 1,
              dp[i - 1][j - 1] + cost
            );
          }
        }
        return dp[m][n];
      };
      const sim = (a: string, b: string) => {
        if (!a || !b) return 0;
        if (a === b) return 1;
        const lev = levenshtein(a, b);
        const levRatio = 1 - (lev / Math.max(a.length, b.length));
        const jac = jaccard(a, b);
        return 0.7 * levRatio + 0.3 * jac;
      };

      let is_duplicate = false;
      let duplicate_id: string | null = null;
      let reason = 'Sin candidatos proporcionados';

      if (candidates.length > 0) {
        const canonCandidates = candidates.map(c => ({ id: c.id, country: c.country ?? null, name: c.name, canon: sanitize(c.name) }));
        const exact = canonCandidates.find(c => c.canon === canon && (!country || !c.country || String(c.country).toLowerCase() === String(country).toLowerCase()));
        if (exact) {
          is_duplicate = true;
          duplicate_id = exact.id;
          reason = 'Coincidencia exacta tras normalización' + (country ? ' + país compatible' : '');
        } else {
          let best = { id: '', score: 0, canon: '', countryMatch: false, name: '' } as any;
          for (const c of canonCandidates) {
            const s = sim(c.canon, canon);
            const cm = country && c.country ? String(c.country).toLowerCase() === String(country).toLowerCase() : false;
            if (s > best.score) best = { id: c.id, score: s, canon: c.canon, countryMatch: cm, name: c.name };
          }
          if (best.score >= 0.96 || (best.score >= 0.92 && best.countryMatch)) {
            is_duplicate = true;
            duplicate_id = best.id;
            reason = `Alta similitud (${best.score.toFixed(3)})` + (best.countryMatch ? ' + país coincide' : '') + ` vs "${best.name}"`;
          } else {
            reason = `Mejor similitud insuficiente (${best.score.toFixed(3)})`;
          }
        }
      }

      return new Response(JSON.stringify({ normalized_name, is_duplicate, duplicate_id, reason }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Preparación para generate_company_tags (si prompt es URL, hacemos fetch y extraemos texto)
    if (type === 'generate_company_tags') {
      let publicText = userPrompt;
      try {
        const isUrl = /^https?:\/\//i.test(userPrompt.trim());
        if (isUrl) {
          console.log('[generate_company_tags] Fetch URL:', userPrompt);
          const res = await fetch(userPrompt, { method: 'GET' });
          const html = await res.text();
          const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, ' ')
            .replace(/<style[\s\S]*?<\/style>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          publicText = text.slice(0, 20000);
        }
      } catch (e) {
        console.warn('[generate_company_tags] Error al obtener contenido de URL, usando prompt original:', e);
      }

      model = 'gpt-4o';
      systemPrompt = `Actúas como analista de CRM para M&A. A partir de CONTENIDO PÚBLICO (texto o extracto de web), genera etiquetas estandarizadas SOLO con el objeto company_tags del esquema de 5.1.\n\nDevuelve EXCLUSIVAMENTE JSON válido con la clave raíz "company_tags" y su estructura interna EXACTA (sin prosa, sin claves adicionales).\nSi la señal es insuficiente, devuelve cadenas vacías, nulls o false según corresponda.`;
      userPrompt = `CONTENIDO:\n\n${publicText}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: (type === 'parse_operations' || type === 'classify_contact_tags' || type === 'generate_company_tags') ? 0.1 : 0.7,
        max_tokens: type === 'generate_proposal' ? 2000 : 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Para tipos con salida estricta JSON, intentar parsear
    if (type === 'parse_operations' || type === 'classify_contact_tags' || type === 'generate_company_tags' || type === 'summarize_meeting' || type === 'backfill_data') {
      try {
        const parsedResult = JSON.parse(result);
        return new Response(JSON.stringify(parsedResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.error('Error parsing JSON from OpenAI:', e);
        if (type === 'summarize_meeting') {
          const fallback = {
            summary: [],
            classification: 'prospecto',
            contact_updates: { interest: [], capacity: { ticket_min: null, ticket_max: null } },
            company_updates: { profile: { seller_ready: false, buyer_active: false } },
            next_actions: [],
            confidence: 0
          };
          return new Response(JSON.stringify(fallback), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          operations: [],
          errors: ['Error procesando con IA: Respuesta inválida'],
          confidence: 0
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response(JSON.stringify({ 
      result,
      type,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in openai-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(serve_handler);