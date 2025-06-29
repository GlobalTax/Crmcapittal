
export interface Deal {
  id: string;
  deal_name: string;
  company_name?: string;
  deal_value?: number;
  currency: string;
  deal_type: string;
  stage_id?: string;
  priority: string;
  deal_owner?: string;
  ebitda?: number;
  revenue?: number;
  multiplier?: number;
  sector?: string;
  location?: string;
  employees?: number;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_role?: string;
  description?: string;
  lead_source?: string;
  next_activity?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  close_date?: string;
  is_active: boolean;
  stage?: {
    id: string;
    name: string;
    color: string;
    order_index: number;
  };
}

export type DealPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type DealType = 'venta' | 'compra' | 'fusion' | 'valoracion' | 'consultoria';
