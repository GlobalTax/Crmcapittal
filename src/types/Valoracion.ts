
export interface Valoracion {
  id: string;
  company_name: string;
  client_name: string;
  company_sector?: string;
  company_description?: string;
  status: ValoracionStatus;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  priority?: ValoracionPriority;
  phase_history?: ValoracionPhaseHistory[];
}

export type ValoracionStatus = 'requested' | 'in_process' | 'completed' | 'delivered';
export type ValoracionPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ValoracionPhaseHistory {
  id: string;
  valoracion_id: string;
  phase: ValoracionStatus;
  changed_by: string;
  changed_at: string;
  notes?: string;
}

export interface ValoracionPhase {
  key: ValoracionStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
}
