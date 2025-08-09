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
  type: 'parse_operations' | 'generate_email' | 'analyze_data' | 'generate_proposal' | 'classify_contact_tags';
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
        temperature: (type === 'parse_operations' || type === 'classify_contact_tags') ? 0.1 : 0.7,
        max_tokens: type === 'generate_proposal' ? 2000 : 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;

    // Para parse_operations, intentar parsear como JSON
    if (type === 'parse_operations' || type === 'classify_contact_tags') {
      try {
        const parsedResult = JSON.parse(result);
        return new Response(JSON.stringify(parsedResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (e) {
        console.error('Error parsing JSON from OpenAI:', e);
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