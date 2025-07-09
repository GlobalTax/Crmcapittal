export interface MandateDocument {
  id: string;
  mandate_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
  notes?: string;
  target_id?: string;
  is_confidential?: boolean;
  uploaded_by?: string;
  created_at?: string;
  updated_at?: string;
  uploaded_at?: string;
}

export interface CreateMandateDocumentData {
  mandate_id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
  notes?: string;
  target_id?: string;
  is_confidential?: boolean;
  uploaded_by?: string;
}

export const MANDATE_DOCUMENT_TYPES = [
  'presentation',
  'financial',
  'legal',
  'technical',
  'commercial',
  'contract',
  'proposal',
  'other'
] as const;

export type MandateDocumentType = typeof MANDATE_DOCUMENT_TYPES[number];

export const DOCUMENT_TYPE_LABELS: Record<MandateDocumentType, string> = {
  presentation: 'Presentación',
  financial: 'Financiero',
  legal: 'Legal',
  technical: 'Técnico',
  commercial: 'Comercial',
  contract: 'Contrato',
  proposal: 'Propuesta',
  other: 'Otros'
};