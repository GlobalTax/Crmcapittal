export type OpportunityType = 'deal' | 'negocio' | 'transaction';
export type OpportunityStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'in_progress';
export type OpportunityStatus = 'active' | 'inactive' | 'paused' | 'completed';
export type OpportunityPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContactRole = 'decision_maker' | 'influencer' | 'champion' | 'advisor' | 'legal' | 'contact' | 'stakeholder';

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  opportunity_type: OpportunityType;
  stage: OpportunityStage;
  status: OpportunityStatus;
  priority?: OpportunityPriority;
  value?: number;
  currency?: string;
  close_date?: string;
  probability?: number;
  
  // Scoring de oportunidad (0-100 cada factor)
  sector_attractiveness?: number;
  investment_capacity?: number;
  urgency?: number;
  strategic_fit?: number;
  opportunity_score?: number;
  score_updated_at?: string;
  
  // Relaciones
  company_id?: string;
  created_by?: string;
  assigned_to?: string;
  
  // Metadatos específicos por tipo
  deal_source?: string;
  sector?: string;
  location?: string;
  employees?: number;
  revenue?: number;
  ebitda?: number;
  multiplier?: number;
  
  // ROD Builder fields
  highlighted?: boolean;
  rod_order?: number;
  notes?: string;
  
  // Campos de auditoría
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface OpportunityContact {
  id: string;
  opportunity_id: string;
  contact_id: string;
  role: ContactRole;
  is_primary?: boolean;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface CreateOpportunityData {
  title: string;
  description?: string;
  opportunity_type: OpportunityType;
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  priority?: OpportunityPriority;
  value?: number;
  currency?: string;
  close_date?: string;
  probability?: number;
  company_id?: string;
  assigned_to?: string;
  deal_source?: string;
  sector?: string;
  location?: string;
  employees?: number;
  revenue?: number;
  ebitda?: number;
  
  // Scoring de oportunidad (0-100 cada factor)
  sector_attractiveness?: number;
  investment_capacity?: number;
  urgency?: number;
  strategic_fit?: number;
  opportunity_score?: number;
  
  multiplier?: number;
  highlighted?: boolean;
  rod_order?: number;
  notes?: string;
}

export interface UpdateOpportunityData extends Partial<CreateOpportunityData> {
  id: string;
}

export interface OpportunityWithContacts extends Opportunity {
  contacts?: (OpportunityContact & {
    contact?: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      position?: string;
    };
  })[];
  company?: {
    id: string;
    name: string;
    industry?: string;
  };
}