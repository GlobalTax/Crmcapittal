import { supabase } from "@/integrations/supabase/client";
import { format, addDays, setHours, setMinutes, isWeekend, nextDay } from "date-fns";
import { es } from "date-fns/locale";
import type { Lead } from "@/types/Lead";
import type { Company } from "@/types/Company";

// Tipos principales
export interface EmailContext {
  lead?: Partial<Lead> & { name?: string; email?: string };
  company?: Partial<Company> & { name?: string };
  deal?: { value?: number; stage?: string; close_date?: string | Date };
  purpose:
    | "intro"
    | "follow_up"
    | "meeting_request"
    | "nda"
    | "mandate"
    | "thank_you"
    | string;
  language?: "es" | "en";
  tone?: "formal" | "neutral" | "friendly";
  previousEmails?: Email[];
  locale?: string; // ej. "es-ES"
  timezone?: string; // ej. "Europe/Madrid"
}

export interface EmailTemplate {
  subject: string;
  bodyHtml: string;
  bodyText: string;
  suggestedSendTimes: string[]; // ISO strings
  variablesUsed: string[];
}

export interface SentimentAnalysis {
  label: "positive" | "neutral" | "negative";
  score: number; // 0..1
  keywords: string[];
}

export interface Email {
  id?: string;
  from: string;
  to: string[];
  date: string | Date;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
}

export interface Action {
  type: "reply" | "schedule_call" | "send_nda" | "ask_info" | "set_task" | string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueAt?: string; // ISO
}

// Utilidad simple para interpolar variables {{path}}
function renderTemplate(template: string, vars: Record<string, any>): string {
  return template.replace(/{{\s*([\w\.]+)\s*}}/g, (_, key) => {
    const value = key.split(".").reduce((acc: any, part: string) => (acc ? acc[part] : undefined), vars as any);
    return value == null ? "" : String(value);
  });
}

function currencyEUR(value?: number) {
  if (value == null) return "";
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `€${value}`;
  }
}

function pickLanguage(ctx?: EmailContext): "es" | "en" {
  return ctx?.language || (ctx?.locale?.startsWith("es") ? "es" : "es");
}

// Sugerir mejores horarios (B2B): Mar-Jue 9:30, 11:30, 15:30 en tz del lead (si no, Europe/Madrid)
function suggestSendTimes(ctx?: EmailContext, count = 5): string[] {
  const tz = ctx?.timezone || "Europe/Madrid";
  const base = new Date();
  const slots: { day: number; hour: number; minute: number }[] = [
    { day: 2, hour: 9, minute: 30 }, // Tue
    { day: 3, hour: 11, minute: 30 }, // Wed
    { day: 4, hour: 15, minute: 30 }, // Thu
  ];
  const results: string[] = [];

  let d = base;
  while (results.length < count) {
    for (const s of slots) {
      let next = d;
      // nextDay numeric: 0=Sunday ... 6=Saturday; we mapped 2=Tue,3=Wed,4=Thu
      next = nextDay(next, s.day as 0 | 1 | 2 | 3 | 4 | 5 | 6);
      next = setHours(next, s.hour);
      next = setMinutes(next, s.minute);
      if (next < new Date()) next = addDays(next, 7);
      // Nota: El tz se aplicará del lado del cliente al programar; devolvemos ISO local
      results.push(new Date(next).toISOString());
      if (results.length >= count) break;
    }
    d = addDays(d, 7);
  }
  return results.slice(0, count);
}

// Fallback simple de análisis de sentimiento
function naiveSentiment(text: string): SentimentAnalysis {
  const t = text.toLowerCase();
  const positives = ["gracias", "interes", "interested", "ok", "de acuerdo", "excelente", "perfecto"];
  const negatives = ["no", "rechazo", "no interesado", "cancelar", "malo", "problema", "queja"];
  let score = 0.5;
  positives.forEach((w) => {
    if (t.includes(w)) score += 0.1;
  });
  negatives.forEach((w) => {
    if (t.includes(w)) score -= 0.15;
  });
  score = Math.max(0, Math.min(1, score));
  const label: SentimentAnalysis["label"] = score > 0.6 ? "positive" : score < 0.4 ? "negative" : "neutral";
  const keywords = [...new Set(positives.concat(negatives).filter((w) => t.includes(w)))];
  return { label, score, keywords };
}

// Generación base de asunto por propósito (ES)
function baseSubjects(ctx: EmailContext): string[] {
  const name = ctx.lead?.name || "";
  const company = ctx.company?.name || ctx.lead?.company || "";
  const dealValue = ctx.deal?.value ? currencyEUR(ctx.deal.value) : "";

  switch (ctx.purpose) {
    case "intro":
      return [
        `Presentación rápida — ${company ? company : "oportunidad"}`,
        `${name ? name + ", " : ""}¿valoramos posibles sinergias?`,
        `Ideas para ${company}: crecimiento inorgánico (${dealValue || "M&A"})`,
      ];
    case "meeting_request":
      return [
        `${name ? name + ", " : ""}¿agenda para 15 min esta semana?`,
        `Propuesta breve — ${company}`,
        `Explorar mandato (${dealValue || "M&A"}) — ${company}`,
      ];
    case "nda":
      return [
        `NDA para avanzar con ${company}`,
        `Confidencialidad — siguiente paso`,
        `Acuerdo NDA para compartir teaser/info`,
      ];
    case "mandate":
      return [
        `Borrador de Mandato — revisión`,
        `Siguiente versión de Mandato para ${company}`,
        `Confirmación de alcance y fees (borrador)`,
      ];
    case "follow_up":
      return [
        `${name ? name + ", " : ""}seguimiento de nuestra conversación`,
        `Sigo a tu disposición — ${company}`,
        `¿Te va bien si retomamos?`,
      ];
    case "thank_you":
      return [
        `Gracias por tu tiempo — ${company}`,
        `Encantados de hablar — próximos pasos`,
        `Agradecimiento y resumen breve`,
      ];
    default:
      return [
        `Propuesta para ${company}`,
        `${name ? name + ", " : ""}oportunidad M&A`,
        `Explorar colaboración (${dealValue || "M&A"})`,
      ];
  }
}

function defaultBody(ctx: EmailContext): { html: string; text: string; variables: string[] } {
  const lang = pickLanguage(ctx);
  const vars = {
    lead: {
      name: ctx.lead?.name || "",
      email: ctx.lead?.email || "",
      company: (ctx.lead as any)?.company || ctx.company?.name || "",
    },
    company: { name: ctx.company?.name || (ctx.lead as any)?.company || "" },
    deal: { value: ctx.deal?.value ? currencyEUR(ctx.deal.value) : "", stage: ctx.deal?.stage || "" },
  };
  const paragraphsES: Record<string, string[]> = {
    intro: [
      "Soy {{sender.name}}, de {{sender.firm}}. Hemos analizado {{company.name}} y vemos encaje con varios compradores/operaciones en curso.",
      "Si te encaja, puedo compartir un teaser/brief no confidencial y comentar opciones en 15 minutos.",
    ],
    meeting_request: [
      "¿Te va bien una breve llamada para validar encaje sectorial y rango EV?",
      "Propongo Martes-Jueves (9:30 / 11:30 / 15:30). Puedo adaptarme a tu agenda.",
    ],
    nda: [
      "Adjunto enlace para firmar el NDA y poder enviar el teaser/brief.",
      "Quedo atento por si prefieres tu propio modelo.",
    ],
    mandate: [
      "Adjunto borrador de mandato con alcance, fees y calendario estimado.",
      "Encantado de iterarlo hasta la versión final.",
    ],
    follow_up: [
      "Retomo nuestro hilo por si pudiste revisar la propuesta.",
      "Si no es el momento, indícame y ajusto el seguimiento.",
    ],
    thank_you: [
      "Gracias por la conversación. Resumo los próximos pasos y quedo a disposición.",
    ],
  };

  const bodyParas = paragraphsES[ctx.purpose] || paragraphsES["intro"];
  const signature =
    "Un saludo,\n{{sender.name}} — {{sender.firm}}\n{{sender.phone}} | {{sender.email}}";

  const templateText = [
    `Hola {{lead.name}},`,
    ...bodyParas,
    signature,
  ].join("\n\n");

  const templateHtml = [
    `<p>Hola {{lead.name}},</p>`,
    ...bodyParas.map((p) => `<p>${p}</p>`),
    `<p>Un saludo,<br/>{{sender.name}} — {{sender.firm}}<br/>{{sender.phone}} | {{sender.email}}</p>`,
  ].join("\n");

  const variables = [
    "lead.name",
    "company.name",
    "deal.value",
    "sender.name",
    "sender.firm",
    "sender.phone",
    "sender.email",
  ];

  return { html: templateHtml, text: templateText, variables };
}

async function maybeInvokeEdgeFunction<T = any>(
  name: string,
  payload: Record<string, any>
): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke(name, { body: payload });
    if (error) {
      console.warn(`${name} error`, error);
      return null;
    }
    return (data as T) ?? null;
  } catch (e) {
    console.warn(`${name} unavailable`, e);
    return null;
  }
}

// 1) Generar plantilla completa
export async function generateEmailTemplate(context: EmailContext): Promise<EmailTemplate> {
  // Intentar con Edge Function (si existe)
  const aiResult = await maybeInvokeEdgeFunction<{
    subject: string;
    bodyHtml: string;
    bodyText: string;
    variablesUsed?: string[];
    suggestedSendTimes?: string[];
  }>("ai-email-assistant", { action: "generate_template", context });

  const sender = {
    name: "Equipo M&A",
    firm: "CRM Pro",
    phone: "",
    email: "",
  };

  if (aiResult) {
    const suggested = aiResult.suggestedSendTimes?.length
      ? aiResult.suggestedSendTimes
      : suggestSendTimes(context);
    return {
      subject: aiResult.subject,
      bodyHtml: renderTemplate(aiResult.bodyHtml, { ...context, sender }),
      bodyText: renderTemplate(aiResult.bodyText, { ...context, sender }),
      suggestedSendTimes: suggested,
      variablesUsed: aiResult.variablesUsed || [],
    };
  }

  // Fallback local
  const subjects = baseSubjects(context);
  const picked = subjects[0];
  const body = defaultBody(context);
  const suggestions = suggestSendTimes(context);

  return {
    subject: picked,
    bodyHtml: renderTemplate(body.html, { ...context, sender }),
    bodyText: renderTemplate(body.text, { ...context, sender }),
    suggestedSendTimes: suggestions,
    variablesUsed: body.variables,
  };
}

// 2) Optimizar líneas de asunto
export async function optimizeSubjectLine(subject: string): Promise<string[]> {
  const ai = await maybeInvokeEdgeFunction<{ suggestions: string[] }>("ai-email-assistant", {
    action: "optimize_subject",
    subject,
  });
  if (ai?.suggestions?.length) return ai.suggestions.slice(0, 5);

  // Fallback heurístico
  const variants = [
    subject,
    `${subject} — 15 min esta semana`,
    `${subject}: propuesta breve`,
    `${subject} (sin compromiso)`,
    `Re: ${subject}`,
  ];
  // Únicos y sin espacios duplicados
  return [...new Set(variants.map((s) => s.replace(/\s+/g, " ").trim()))].slice(0, 5);
}

// 3) Analizar sentimiento de un email recibido
export async function analyzeEmailSentiment(content: string): Promise<SentimentAnalysis> {
  const ai = await maybeInvokeEdgeFunction<SentimentAnalysis>("ai-email-assistant", {
    action: "analyze_sentiment",
    content,
  });
  if (ai) return ai;
  return naiveSentiment(content);
}

// 4) Sugerir acciones tras un hilo de emails
export async function suggestFollowUpActions(emailThread: Email[]): Promise<Action[]> {
  const ai = await maybeInvokeEdgeFunction<{ actions: Action[] }>("ai-email-assistant", {
    action: "suggest_actions",
    emailThread,
  });
  if (ai?.actions?.length) return ai.actions;

  // Fallback básico
  const last = emailThread[emailThread.length - 1];
  const senti = last?.bodyText ? naiveSentiment(last.bodyText) : { label: "neutral", score: 0.5, keywords: [] };
  const actions: Action[] = [];
  if (senti.label === "positive") {
    actions.push({ type: "schedule_call", title: "Proponer llamada de avance", priority: "high" });
    actions.push({ type: "send_nda", title: "Enviar NDA si procede", priority: "medium" });
  } else if (senti.label === "negative") {
    actions.push({ type: "ask_info", title: "Pedir aclaración de objeciones", priority: "high" });
    actions.push({ type: "set_task", title: "Revisar encaje y replantear propuesta", priority: "medium" });
  } else {
    actions.push({ type: "reply", title: "Enviar recordatorio amable", priority: "medium" });
  }
  return actions;
}
