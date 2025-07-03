
export interface Transaction {
  id: string;
  proposal_id: string;
  company_id?: string;
  contact_id?: string;
  transaction_type: 'sale' | 'acquisition' | 'merger' | 'valuation';
  status: 'nda_pending' | 'nda_signed' | 'teaser_requested' | 'teaser_sent' | 'infomemo_requested' | 'infomemo_sent' | 'due_diligence' | 'closing' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_value?: number;
  currency: string;
  expected_closing_date?: string;
  transaction_code?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  notes?: string;

  // Relations
  proposal?: {
    id: string;
    title: string;
    status: string;
  };
  company?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
    email?: string;
  };
  ndas?: NDA[];
  teasers?: Teaser[];
  info_memos?: InfoMemo[];
}

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

export interface Teaser {
  id: string;
  transaction_id: string;
  teaser_type: 'blind' | 'named';
  status: 'draft' | 'review' | 'approved' | 'distributed' | 'expired';
  title: string;
  anonymous_company_name?: string;
  sector?: string;
  location?: string;
  revenue?: number;
  ebitda?: number;
  employees?: number;
  asking_price?: number;
  currency: string;
  key_highlights?: string[];
  financial_summary?: any;
  document_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  distributed_at?: string;
  expires_at?: string;
}

export interface InfoMemo {
  id: string;
  transaction_id: string;
  status: 'draft' | 'review' | 'approved' | 'published';
  title: string;
  executive_summary?: string;
  company_overview?: string;
  market_analysis?: string;
  financial_information?: any;
  growth_opportunities?: string;
  risk_factors?: string;
  management_team?: any;
  document_url?: string;
  attachments?: any[];
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface DocumentAccessLog {
  id: string;
  document_type: 'teaser' | 'info_memo' | 'nda';
  document_id: string;
  contact_id?: string;
  access_type: 'view' | 'download' | 'share';
  ip_address?: string;
  user_agent?: string;
  accessed_at: string;
  session_duration?: number;
}

export interface CreateTransactionData {
  proposal_id: string;
  company_id?: string;
  contact_id?: string;
  transaction_type: 'sale' | 'acquisition' | 'merger' | 'valuation';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  estimated_value?: number;
  currency?: string;
  expected_closing_date?: string;
  notes?: string;
}

export interface CreateNDAData {
  transaction_id: string;
  nda_type: 'bilateral' | 'unilateral';
  terms_and_conditions?: string;
  expires_at?: string;
  notes?: string;
}

export interface CreateTeaserData {
  transaction_id: string;
  teaser_type: 'blind' | 'named';
  title: string;
  anonymous_company_name?: string;
  sector?: string;
  location?: string;
  revenue?: number;
  ebitda?: number;
  employees?: number;
  asking_price?: number;
  currency?: string;
  key_highlights?: string[];
  financial_summary?: any;
}

export interface CreateInfoMemoData {
  transaction_id: string;
  title: string;
  executive_summary?: string;
  company_overview?: string;
  market_analysis?: string;
  financial_information?: any;
  growth_opportunities?: string;
  risk_factors?: string;
  management_team?: any;
  attachments?: any[];
}
