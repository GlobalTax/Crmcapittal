export interface DocumentContent {
  content?: string;
  blocks?: DocumentBlock[];
  format?: 'rich_text' | 'markdown' | 'html' | 'plain_text';
  version?: string;
  [key: string]: any;
}

export interface DocumentBlock {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'image' | 'custom';
  content: string;
  properties?: Record<string, any>;
  children?: DocumentBlock[];
}

export interface DocumentVariables {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export interface DocumentMetadata {
  author?: string;
  tags?: string[];
  category?: string;
  version?: number;
  language?: string;
  wordCount?: number;
  lastModifiedBy?: string;
  collaborators?: string[];
  customFields?: Record<string, any>;
  [key: string]: any;
}

export interface Document {
  id: string;
  title: string;
  content: DocumentContent;
  template_id?: string | null;
  document_type: string;
  status: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
  variables: DocumentVariables;
  metadata: DocumentMetadata;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string | null;
  content: DocumentContent;
  template_type: string;
  variables: DocumentVariables;
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