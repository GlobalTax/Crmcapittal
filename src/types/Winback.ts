export type WinbackStage = 'cold' | 'campaign_sent' | 'engaging' | 'reopened' | 'irrecuperable';

export type WinbackAttemptStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'responded' | 'skipped';

export type WinbackChannel = 'email' | 'call' | 'linkedin' | 'whatsapp' | 'sms';

export interface WinbackStep {
  dias: number;
  canal: WinbackChannel;
  asunto?: string;
  template_id?: string;
  script?: string;
  mensaje?: string;
  prioridad?: 'low' | 'medium' | 'high';
  duracion_esperada?: number;
  [key: string]: any; // Para campos adicionales flexibles
}

export interface WinbackSequence {
  id: string;
  nombre: string;
  descripcion?: string;
  pasos: WinbackStep[];
  lost_reason_trigger?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WinbackAttempt {
  id: string;
  lead_id: string;
  sequence_id: string;
  step_index: number;
  canal: WinbackChannel;
  template_id?: string;
  scheduled_date: string;
  executed_date?: string;
  status: WinbackAttemptStatus;
  response_data?: any;
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface WinbackStats {
  total_attempts: number;
  pending_today: number;
  successful_reopens: number;
  response_rate: number;
}