
export interface Valoracion {
  id: string;
  company_name: string;
  client_name: string;
  client_email?: string;
  company_sector?: string;
  company_description?: string;
  status: ValoracionStatus;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  priority?: ValoracionPriority;
  phase_history?: ValoracionPhaseHistory[];
  fee_quoted?: number;
  fee_charged?: number;
  payment_status?: PaymentStatus;
  fee_currency?: string;
  payment_date?: string;
  payment_notes?: string;
  valoracion_ev?: number;
}

export interface ValoracionDocument {
  id: string;
  valoracion_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  document_type: 'deliverable' | 'internal';
  review_status: DocumentReviewStatus;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
}

export interface ValoracionDocumentReview {
  id: string;
  document_id: string;
  previous_status?: DocumentReviewStatus;
  new_status: DocumentReviewStatus;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
}

export type DocumentReviewStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

export type ValoracionStatus = 'requested' | 'in_process' | 'completed' | 'delivered';
export type ValoracionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface ValoracionPhaseHistory {
  id: string;
  valoracion_id: string;
  phase: ValoracionStatus;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

export interface ValoracionPhase {
  key: ValoracionStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}
