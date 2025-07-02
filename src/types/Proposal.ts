
export interface Proposal {
  id: string;
  contact_id?: string;
  company_id?: string;
  practice_area_id?: string;
  title: string;
  description?: string;
  total_amount?: number;
  currency: string;
  proposal_type: 'punctual' | 'recurring';
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'in_review' | 'revision_needed';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
  
  // Nuevos campos avanzados
  client_portal_access?: boolean;
  tracking_enabled?: boolean;
  views_count?: number;
  last_viewed_at?: string;
  signature_required?: boolean;
  signed_at?: string;
  proposal_number?: string;
  template_id?: string;
  pdf_url?: string;
  
  // Estructura de servicios
  services?: ProposalService[];
  fee_structure?: FeeStructure;
  timeline?: ProjectMilestone[];
  
  // Configuración visual
  visual_config?: VisualConfig;
  
  // Relations
  contact?: {
    id: string;
    name: string;
    email?: string;
  };
  company?: {
    id: string;
    name: string;
  };
  practice_area?: {
    id: string;
    name: string;
    color: string;
  };
  template?: ProposalTemplate;
}

export interface ProposalService {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  billing_type: 'fixed' | 'hourly' | 'contingent' | 'retainer';
  estimated_hours?: number;
  hourly_rate?: number;
  contingent_percentage?: number;
}

export interface FeeStructure {
  type: 'fixed' | 'hourly' | 'contingent' | 'mixed' | 'retainer';
  base_amount?: number;
  hourly_rate?: number;
  estimated_hours?: number;
  contingent_percentage?: number;
  retainer_amount?: number;
  payment_schedule: PaymentSchedule[];
  discounts?: Discount[];
  taxes?: Tax[];
}

export interface PaymentSchedule {
  id: string;
  description: string;
  amount: number;
  due_date: string;
  percentage?: number;
  milestone_id?: string;
}

export interface Discount {
  id: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  conditions?: string;
}

export interface Tax {
  id: string;
  name: string;
  rate: number;
  amount: number;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  estimated_date: string;
  estimated_hours?: number;
  deliverables: string[];
  payment_percentage?: number;
}

export interface VisualConfig {
  template_id: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  font_family: string;
  cover_image_url?: string;
  custom_css?: string;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  practice_area_id?: string;
  is_default: boolean;
  content_structure: TemplateSection[];
  visual_config: VisualConfig;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  type: 'text' | 'services' | 'fees' | 'timeline' | 'terms' | 'signature';
  title: string;
  content?: string;
  order: number;
  required: boolean;
  editable: boolean;
}

export interface ProposalAnalytics {
  proposal_id: string;
  views: number;
  unique_views: number;
  time_spent: number;
  sections_viewed: string[];
  last_activity: string;
  client_engagement_score: number;
  conversion_probability: number;
}

export interface CreateProposalData {
  contact_id?: string;
  company_id?: string;
  practice_area_id?: string;
  title: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  proposal_type: 'punctual' | 'recurring';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  template_id?: string;
  services?: Omit<ProposalService, 'id'>[];
  fee_structure?: Omit<FeeStructure, 'payment_schedule'> & {
    payment_schedule?: Omit<PaymentSchedule, 'id'>[];
  };
  timeline?: Omit<ProjectMilestone, 'id'>[];
  visual_config?: VisualConfig;
}

export interface UpdateProposalData {
  title?: string;
  description?: string;
  total_amount?: number;
  currency?: string;
  proposal_type?: 'punctual' | 'recurring';
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'in_review' | 'revision_needed';
  valid_until?: string;
  terms_and_conditions?: string;
  notes?: string;
  services?: ProposalService[];
  fee_structure?: FeeStructure;
  timeline?: ProjectMilestone[];
  visual_config?: VisualConfig;
}
