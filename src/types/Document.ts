export interface Document {
  id: string;
  title: string;
  content: any;
  template_id?: string | null;
  document_type: string;
  status: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  variables: any;
  metadata: any;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string | null;
  content: any;
  template_type: string;
  variables: any;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentVariable {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  value?: string | number;
  options?: string[];
  required?: boolean;
}