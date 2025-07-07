export interface DocumentTemplate {
  id: string;
  name: string;
  template_type: DocumentType;
  description?: string;
  content: {
    title: string;
    content: string;
  };
  variables: Record<string, string>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export type DocumentType = 'nda' | 'proposal' | 'mandate';
export type DocumentFormat = 'pdf' | 'docx';

export interface DocumentVariables {
  // Client data
  client_name: string;
  company_name: string;
  client_email: string;
  
  // Advisor data (from current user)
  advisor_name: string;
  advisor_email: string;
  
  // Deal data
  deal_description: string;
  deal_value: string;
  deal_type: string;
  sector: string;
  
  // Template-specific variables
  commission_percentage?: string;
  minimum_fee?: string;
  mandate_duration?: string;
  exclusivity_clause?: string;
  
  // General data
  location: string;
  date: string;
}

export interface GenerateDocumentRequest {
  templateId: string;
  variables: Partial<DocumentVariables>;
  format: DocumentFormat;
  saveToOpportunity: boolean;
}

export interface GeneratedDocument {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  nda: 'NDA - Acuerdo de Confidencialidad',
  proposal: 'Propuesta de Honorarios',
  mandate: 'Mandato de Representación'
};