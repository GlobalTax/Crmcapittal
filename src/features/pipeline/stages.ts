/**
 * Pipeline Stages & Normalization
 * Centraliza las etapas oficiales del pipeline y sus alias
 */

export enum LeadStage {
  NewLead = 'new_lead',
  Qualified = 'qualified',
  NdaSent = 'nda_sent',
  NdaSigned = 'nda_signed',
  InfoShared = 'info_shared',
  Negotiation = 'negotiation',
  MandateSigned = 'mandate_signed',
  ClosedLost = 'closed_lost',
}

// Alias conocidos (distintas grafías, con espacios, snake_case o español)
const STAGE_ALIASES: Record<string, LeadStage> = {
  // New Lead
  'new lead': LeadStage.NewLead,
  'new_lead': LeadStage.NewLead,
  'nuevo lead': LeadStage.NewLead,

  // Qualified
  'qualified': LeadStage.Qualified,
  'cualificado': LeadStage.Qualified,

  // NDA Sent
  'nda sent': LeadStage.NdaSent,
  'nda_sent': LeadStage.NdaSent,
  'nda enviado': LeadStage.NdaSent,

  // NDA Signed
  'nda signed': LeadStage.NdaSigned,
  'nda_signed': LeadStage.NdaSigned,
  'nda firmado': LeadStage.NdaSigned,

  // Info Shared
  'info shared': LeadStage.InfoShared,
  'info_shared': LeadStage.InfoShared,
  'info compartida': LeadStage.InfoShared,

  // Negotiation
  'negotiation': LeadStage.Negotiation,
  'negociacion': LeadStage.Negotiation,
  'negociación': LeadStage.Negotiation,

  // Mandate Signed
  'mandate signed': LeadStage.MandateSigned,
  'mandate_signed': LeadStage.MandateSigned,
  'mandato firmado': LeadStage.MandateSigned,

  // Closed Lost
  'closed lost': LeadStage.ClosedLost,
  'closed_lost': LeadStage.ClosedLost,
  'perdido': LeadStage.ClosedLost,
};

/**
 * Normaliza el nombre de etapa a un valor del enum LeadStage
 */
export const normalizeStage = (stageName: string): LeadStage | null => {
  if (!stageName) return null;
  const key = stageName
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD') // separa acentos
    .replace(/\p{Diacritic}+/gu, '') // elimina diacríticos
    .replace(/\s+/g, ' ') // colapsa espacios
    .trim();

  return STAGE_ALIASES[key] ?? null;
};
