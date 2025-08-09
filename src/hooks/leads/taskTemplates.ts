// Task templates for Lead Task Engine
// Centraliza títulos por defecto, prioridad, offset de vencimiento, dependencias y metadatos

export type TemplatePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface LeadTaskTemplate {
  title: string;
  defaultPriority: TemplatePriority;
  // Días desde ahora para la fecha de vencimiento (T+Nd). Ej: 0 = hoy, 1 = mañana
  dueOffsetDays: number;
  // Dependencias obligatorias (si son opcionales, no las incluimos aquí y las indicamos en metadata)
  deps?: string[];
  metadata?: Record<string, any>;
}

export const TASK_TEMPLATES: Record<string, LeadTaskTemplate> = {
  whatsapp: {
    title: 'WhatsApp de contacto',
    defaultPriority: 'medium',
    dueOffsetDays: 0,
    metadata: { plantilla: 'whatsapp_touch_v1', link_agenda: true },
  },
  llamada: {
    title: 'Llamada telefónica al lead',
    defaultPriority: 'medium',
    dueOffsetDays: 1,
    metadata: { script: 'call_script_v1', objetivo: 'calificar necesidad' },
  },
  videollamada: {
    title: 'Agendar video llamada',
    defaultPriority: 'high',
    dueOffsetDays: 0,
    // deps opcionales → no bloquear el inicio; las dejamos como sugeridas en metadata
    metadata: { plataforma: 'Teams/Zoom', link_auto: true, asistentes_sugeridos: ['owner','analista'], duracion: '30m', deps_sugeridas: ['whatsapp','llamada'] },
  },
  informe_mercado: {
    title: 'Crear informe de mercado',
    defaultPriority: 'medium',
    dueOffsetDays: 2,
    metadata: { formato: 'PDF', estructura: ['tamaño mercado','tendencias','competidores','múltiplos','SWOT','fuentes'], storage_path: '', review_status: 'pending' },
  },
  preguntas_reunion: {
    title: 'Preparar preguntas para reunión',
    defaultPriority: 'high',
    dueOffsetDays: 1,
    // deps opcionales → sugeridas en metadata
    metadata: { bloques: ['objetivos','dolores','finanzas','decisión','siguiente_paso'], deps_sugeridas: ['informe_mercado'] },
  },
  datos_sabi: {
    title: 'Descargar datos SABI/eInforma',
    defaultPriority: 'high',
    dueOffsetDays: 0,
    metadata: { fuente: 'einforma', campos: ['facturacion','ebitda','deuda','plantilla'] },
  },
  balances_4y: {
    title: 'Incorporar balances 4 años y cuenta de explotación',
    defaultPriority: 'high',
    dueOffsetDays: 2,
    deps: ['datos_sabi'],
    metadata: { origen: 'excel/pdf', funcion_parser: 'process-excel-valoracion' },
  },
  valoracion_inicial: {
    title: 'Enviar valoración inicial gratuita',
    defaultPriority: 'high',
    dueOffsetDays: 1,
    // deps condicionales → no bloquear; sugeridas en metadata
    metadata: { plantilla_pdf: 'valuation_light', multiples_fuente: 'einforma/sabi', deps_sugeridas: ['informe_mercado','balances_4y'] },
  },
  perfilar_oportunidad: {
    title: 'Perfilar la oportunidad',
    defaultPriority: 'medium',
    dueOffsetDays: 3,
    deps: ['informe_mercado','balances_4y'],
    metadata: { score_campos: ['atractivo_sector','capacidad_inversion','urgencia','fit_estrategico'] },
  },
};
