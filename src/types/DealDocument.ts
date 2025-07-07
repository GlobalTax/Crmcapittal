export interface DealDocument {
  id: string;
  deal_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
  document_category: DocumentCategory;
  document_status: DocumentStatus;
  order_position: number;
  notes?: string;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory = 
  | 'nda'
  | 'proposal'
  | 'mandate'
  | 'confidential'
  | 'contract'
  | 'financial'
  | 'other';

export type DocumentStatus = 
  | 'draft'
  | 'sent'
  | 'signed'
  | 'reviewed'
  | 'rejected';

export interface CreateDealDocumentData {
  deal_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
  document_category: DocumentCategory;
  document_status?: DocumentStatus;
  order_position?: number;
  notes?: string;
  uploaded_by?: string;
}

export const DOCUMENT_CATEGORIES: Record<DocumentCategory, { label: string; icon: string; color: string }> = {
  nda: { label: 'NDA', icon: '🔒', color: 'bg-red-100 text-red-600' },
  proposal: { label: 'Propuesta', icon: '📄', color: 'bg-blue-100 text-blue-600' },
  mandate: { label: 'Mandato', icon: '📋', color: 'bg-green-100 text-green-600' },
  confidential: { label: 'Confidencial', icon: '🔐', color: 'bg-purple-100 text-purple-600' },
  contract: { label: 'Contrato', icon: '📝', color: 'bg-orange-100 text-orange-600' },
  financial: { label: 'Financiero', icon: '💰', color: 'bg-yellow-100 text-yellow-600' },
  other: { label: 'Otro', icon: '📁', color: 'bg-gray-100 text-gray-600' }
};

export const DOCUMENT_STATUSES: Record<DocumentStatus, { label: string; color: string }> = {
  draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-600' },
  signed: { label: 'Firmado', color: 'bg-green-100 text-green-600' },
  reviewed: { label: 'Revisado', color: 'bg-yellow-100 text-yellow-600' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-600' }
};