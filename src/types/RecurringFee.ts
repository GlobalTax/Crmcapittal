
export interface RecurringFee {
  id: string;
  contact_id: string;
  company_id?: string;
  practice_area_id: string;
  proposal_id?: string;
  fee_name: string;
  amount: number;
  currency: string;
  billing_frequency: 'monthly' | 'quarterly' | 'yearly';
  billing_type: 'fixed' | 'per_employee' | 'per_service';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
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
  proposal?: {
    id: string;
    title: string;
  };
}

export interface FeeHistory {
  id: string;
  recurring_fee_id: string;
  billing_period_start: string;
  billing_period_end: string;
  amount: number;
  currency: string;
  status: 'pending' | 'invoiced' | 'paid' | 'cancelled';
  invoice_number?: string;
  invoice_date?: string;
  payment_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRecurringFeeData {
  contact_id: string;
  company_id?: string;
  practice_area_id: string;
  proposal_id?: string;
  fee_name: string;
  amount: number;
  currency?: string;
  billing_frequency: 'monthly' | 'quarterly' | 'yearly';
  billing_type?: 'fixed' | 'per_employee' | 'per_service';
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface UpdateRecurringFeeData {
  fee_name?: string;
  amount?: number;
  currency?: string;
  billing_frequency?: 'monthly' | 'quarterly' | 'yearly';
  billing_type?: 'fixed' | 'per_employee' | 'per_service';
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  notes?: string;
}
