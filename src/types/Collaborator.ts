export type CollaboratorType = 'referente' | 'partner_comercial' | 'agente' | 'freelancer';
export type CommissionStatus = 'pending' | 'paid' | 'cancelled';

export interface Collaborator {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  collaborator_type: CollaboratorType;
  commission_percentage: number;
  base_commission: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateCollaboratorData {
  name: string;
  email?: string;
  phone?: string;
  collaborator_type: CollaboratorType;
  commission_percentage?: number;
  base_commission?: number;
  notes?: string;
}

export interface CollaboratorCommission {
  id: string;
  collaborator_id: string;
  lead_id?: string;
  deal_id?: string;
  commission_amount: number;
  commission_percentage?: number;
  status: CommissionStatus;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}