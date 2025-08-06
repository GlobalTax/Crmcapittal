
export type LeadStage = 'CAPTURED' | 'QUALIFIED' | 'NURTURING' | 'SALES_READY' | 'CONVERTED' | 'LOST';
export type LeadSource = 'WEBSITE_FORM' | 'CAPITAL_MARKET' | 'REFERRAL' | 'EMAIL_CAMPAIGN' | 'SOCIAL_MEDIA' | 'COLD_OUTREACH' | 'EVENT' | 'OTHER';
export type NurturingStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
export type ActivityType = 'EMAIL_SENT' | 'EMAIL_OPENED' | 'EMAIL_CLICKED' | 'CALL_MADE' | 'MEETING_SCHEDULED' | 'FORM_SUBMITTED' | 'WEBSITE_VISIT' | 'DOCUMENT_DOWNLOADED';

export interface LeadNurturing {
  id: string;
  lead_id: string;
  stage: LeadStage;
  lead_score: number;
  engagement_score: number;
  last_activity_date?: string;
  next_action_date?: string;
  nurturing_status: NurturingStatus;
  assigned_to_id?: string;
  source_details: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    referrer?: string;
    landing_page?: string;
  };
  qualification_criteria: {
    budget_range?: string;
    timeline?: string;
    authority?: boolean;
    need_identified?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  activity_data: Record<string, any>;
  points_awarded: number;
  created_at: string;
  created_by?: string;
}

export interface NurturingSequence {
  id: string;
  name: string;
  description?: string;
  trigger_criteria: {
    lead_source?: LeadSource[];
    lead_score_min?: number;
    lead_score_max?: number;
    stage?: LeadStage[];
  };
  steps: NurturingStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NurturingStep {
  id: string;
  sequence_id: string;
  step_order: number;
  step_type: 'EMAIL' | 'TASK' | 'DELAY' | 'CONDITION';
  delay_days: number;
  email_template_id?: string;
  task_description?: string;
  condition_criteria?: Record<string, any>;
  is_active: boolean;
}

export interface LeadScoringRule {
  id: string;
  nombre: string;
  description?: string;
  condicion: {
    activity_type: ActivityType;
    criteria: Record<string, any>;
  };
  valor: number;
  activo: boolean;
  created_at: string;
}

export interface LeadScoreLog {
  id: string;
  lead_id: string;
  regla: string;
  delta: number;
  total: number;
  fecha: string;
}
