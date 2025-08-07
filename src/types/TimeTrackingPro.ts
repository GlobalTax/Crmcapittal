// Tipos mejorados para Time Tracking Profesional

export interface ActivityCategory {
  id: string;
  name: string;
  color: string;
  is_billable_by_default: boolean;
  default_hourly_rate?: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectRate {
  id: string;
  entity_type: 'lead' | 'mandate' | 'contact' | 'company';
  entity_id: string;
  hourly_rate: number;
  currency: string;
  is_active: boolean;
  effective_from: string;
  effective_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProductivitySettings {
  id: string;
  user_id: string;
  break_reminder_interval: number; // minutos
  daily_hours_target: number;
  productivity_tracking_enabled: boolean;
  auto_categorization_enabled: boolean;
  smart_suggestions_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivitySuggestion {
  id: string;
  user_id: string;
  suggested_activity: string;
  context_entity_type?: string;
  context_entity_id?: string;
  confidence_score: number;
  status: 'pending' | 'accepted' | 'dismissed';
  suggested_at: string;
  responded_at?: string;
}

export interface ProductivityPattern {
  id: string;
  user_id: string;
  pattern_type: 'peak_hours' | 'break_optimal' | 'activity_preference';
  pattern_data: any;
  confidence_level: number;
  data_points_count: number;
  last_calculated: string;
  created_at: string;
  updated_at: string;
}

export interface TimeTrackingAnalytics {
  id: string;
  user_id: string;
  date: string;
  total_minutes: number;
  billable_minutes: number;
  productive_minutes: number;
  break_minutes: number;
  activities_count: number;
  focus_score: number;
  efficiency_score: number;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryApproval {
  id: string;
  time_entry_id: string;
  approver_id: string;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_required';
  comments?: string;
  approved_amount?: number;
  submitted_at: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

// Extensión del TimeEntry existente
export interface EnhancedTimeEntry {
  id: string;
  activity_type: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  description?: string;
  user_id: string;
  planned_task_id?: string;
  contact_id?: string;
  operation_id?: string;
  lead_id?: string;
  mandate_id?: string;
  is_billable: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
  // Nuevos campos
  category_id?: string;
  project_rate_id?: string;
  break_type?: 'short' | 'long' | 'lunch';
  focus_score?: number;
  interruptions_count?: number;
  auto_categorized?: boolean;
  billing_status: 'draft' | 'submitted' | 'approved' | 'billed' | 'paid';
  tags?: string[];
  metadata?: any;
  // Relaciones
  category?: ActivityCategory;
  project_rate?: ProjectRate;
  planned_task?: { title: string };
  lead?: { id: string; name: string; company_name: string };
  mandate?: { id: string; mandate_name: string; client_name: string };
  contact?: { id: string; name: string };
}

export interface SmartTimerSuggestion {
  type: 'continue_work' | 'break_reminder' | 'category_suggestion' | 'rate_suggestion';
  title: string;
  message: string;
  action?: string;
  data?: any;
  confidence: number;
}

export interface TimerContext {
  current_entity?: {
    type: 'lead' | 'mandate' | 'contact' | 'company';
    id: string;
    name: string;
  };
  last_activity?: string;
  suggested_category?: ActivityCategory;
  suggested_rate?: number;
  break_due?: boolean;
  focus_session_count?: number;
}

export interface ProductivityMetrics {
  peak_hours: number[];
  optimal_break_interval: number;
  average_focus_duration: number;
  most_productive_categories: string[];
  efficiency_trend: number;
  revenue_per_hour: number;
  billable_percentage: number;
  daily_goal_achievement: number;
}

export interface TeamTimeData {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  active_timer?: EnhancedTimeEntry;
  daily_hours: number;
  weekly_hours: number;
  billable_hours: number;
  current_project?: {
    type: string;
    name: string;
    rate?: number;
  };
  productivity_score: number;
  last_activity?: string;
  status: 'active' | 'break' | 'offline';
}

export interface CreateTimeEntryProData {
  activity_type: string;
  start_time: string;
  end_time?: string;
  description?: string;
  planned_task_id?: string;
  contact_id?: string;
  operation_id?: string;
  lead_id?: string;
  mandate_id?: string;
  is_billable?: boolean;
  hourly_rate?: number;
  category_id?: string;
  project_rate_id?: string;
  break_type?: 'short' | 'long' | 'lunch';
  focus_score?: number;
  interruptions_count?: number;
  tags?: string[];
  metadata?: any;
}

export interface TimeTrackingFilter {
  date_from?: string;
  date_to?: string;
  category_ids?: string[];
  is_billable?: boolean;
  billing_status?: string[];
  entity_type?: string;
  entity_id?: string;
  tags?: string[];
  min_duration?: number;
  max_duration?: number;
}

export interface TimeTrackingReport {
  period: {
    start: string;
    end: string;
  };
  total_time: number;
  billable_time: number;
  revenue_generated: number;
  categories_breakdown: Array<{
    category: ActivityCategory;
    time: number;
    revenue: number;
    percentage: number;
  }>;
  daily_breakdown: Array<{
    date: string;
    total_time: number;
    billable_time: number;
    revenue: number;
    efficiency_score: number;
  }>;
  productivity_metrics: ProductivityMetrics;
  recommendations: string[];
}