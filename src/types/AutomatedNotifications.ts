export interface NotificationRule {
  id: string;
  rule_name: string;
  rule_type: 'high_score_lead' | 'task_reminder' | 'high_prob_negotiation';
  is_active: boolean;
  conditions: {
    min_score?: number;
    reminder_times?: string[];
    days_ahead?: number;
    stage_name?: string;
    min_prob_conversion?: number;
  };
  notification_config: {
    in_app: boolean;
    email: boolean;
    message: string;
  };
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface NotificationLog {
  id: string;
  rule_id: string;
  lead_id?: string;
  task_id?: string;
  notification_type: string;
  recipient_user_id: string;
  message: string;
  sent_at: string;
  delivery_status: 'sent' | 'failed' | 'pending';
  metadata: Record<string, any>;
}

export interface AutomatedNotificationResponse {
  success: boolean;
  notifications_sent: number;
  notifications: Array<{
    type: string;
    lead_name?: string;
    task_title?: string;
    score?: number;
    prob_conversion?: number;
    recipient_id: string;
  }>;
}