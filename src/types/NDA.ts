export interface NDA {
  id: string;
  transaction_id: string;
  nda_type: 'bilateral' | 'unilateral';
  status: 'draft' | 'sent' | 'signed' | 'expired';
  document_url?: string;
  sent_at?: string;
  signed_at?: string;
  expires_at?: string;
  signed_by_client: boolean;
  signed_by_advisor: boolean;
  terms_and_conditions?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface CreateNDAData {
  transaction_id: string;
  nda_type: 'bilateral' | 'unilateral';
  terms_and_conditions?: string;
  expires_at?: string;
  notes?: string;
}