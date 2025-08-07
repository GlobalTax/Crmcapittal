export type EmailTone = 'profesional' | 'casual' | 'urgente';

interface LeadContext {
  name?: string;
  company?: string;
  service_type?: string;
  deal_value?: number;
}

export const emailAssistant = {
  getTemplates(ctx: LeadContext) {
    const base = ctx.company || 'tu compañía';
    return [
      {
        id: 'intro',
        label: 'Introducción (M&A)',
        subject: `Explorar colaboración M&A con ${base}`,
        body: `Hola {{first_name}},\n\nSoy del equipo de M&A de CRM Pro. Ayudamos a accionistas y directivos a preparar y ejecutar procesos de compraventa (1M€–100M€ EV).\n\n¿Te va bien una llamada de 15 minutos para evaluar encaje?\n\nSaludos,\n— Equipo CRM Pro`,
      },
      {
        id: 'nda',
        label: 'Enviar NDA',
        subject: 'NDA para avanzar con información confidencial',
        body: `Hola {{first_name}},\n\nAdjunto nuestro NDA estándar para poder compartir información y avanzar en el análisis.\n\nQuedo atento,\n— Equipo CRM Pro`,
      },
      {
        id: 'followup',
        label: 'Seguimiento amable',
        subject: 'Seguimiento sobre próximos pasos',
        body: `Hola {{first_name}},\n\nSólo un breve recordatorio sobre los próximos pasos. ¿Podemos agendar esta semana?\n\nGracias,\n— Equipo CRM Pro`,
      },
    ];
  },

  optimizeSubject(subject: string) {
    // Heurística simple: versión A directa, versión B con beneficio
    const trimmed = subject.trim();
    const variantA = trimmed;
    const variantB = trimmed.includes('·') ? trimmed : `${trimmed} · próximos pasos claros`;
    return { A: variantA, B: variantB };
  },

  improveContent(htmlOrText: string, tone: EmailTone) {
    // Mejora heurística simple según tono
    const add = tone === 'profesional'
      ? '\n\nQuedo a tu disposición para cualquier aclaración.\n\nSaludos cordiales,'
      : tone === 'casual'
      ? '\n\n¿Te encaja esta semana? Gracias!'
      : '\n\nImportante: necesitamos tu feedback para no bloquear el proceso.';

    // Si parece HTML, conservar saltos, si no, convertir a párrafos en el UI
    return htmlOrText + add;
  },

  predictBestSendTime(ctx: LeadContext) {
    // Heurística: martes/jueves 10:00 locales
    return { day: 'Martes', time: '10:00', confidence: 0.74 };
  },

  analyzeSentiment(text: string) {
    const t = text.toLowerCase();
    const positive = ['gracias', 'interes', 'adelante', 'perfecto', 'ok', 'sí'];
    const negative = ['no', 'rechazo', 'cancel', 'mal', 'tarde', 'imposible'];
    let score = 0;
    positive.forEach(k => { if (t.includes(k)) score += 1; });
    negative.forEach(k => { if (t.includes(k)) score -= 1; });
    const label = score > 0 ? 'positivo' : score < 0 ? 'negativo' : 'neutral';
    return { label, score };
  },

  tokens: [
    { key: '{{first_name}}', description: 'Nombre del contacto' },
    { key: '{{company}}', description: 'Nombre de la empresa' },
    { key: '{{deal_value}}', description: 'Valor estimado del deal' },
  ],
};
