export type ActivityType = 'lead_interaction' | 'mandate_activity' | 'reconversion_audit' | 'valoracion_security';

export type ActivityEntityType = 'lead' | 'mandate' | 'reconversion' | 'valoracion';

export interface UnifiedActivity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  icon: string; // emoji icon
  timestamp: string;
  user_name?: string;
  user_email?: string;
  entity_id: string; // lead_id, target_id, reconversion_id, valoracion_id
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  source_table: string;
  activity_subtype?: string; // email, phone, note, etc.
}

export interface DayGroup {
  date: string;
  activities: UnifiedActivity[];
  count: number;
}

export interface UnifiedTimelineFilters {
  type?: ActivityType[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  severity?: string[];
}