
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface PlannedTask {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  date: string;
  estimated_duration?: number; // in minutes
  status: TaskStatus;
  lead_id?: string;
  contact_id?: string;
  operation_id?: string;
  mandate_id?: string;
  target_company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
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
  // Related data from joins
  planned_task?: { title: string };
  lead?: { id: string; name: string; company_name: string };
  mandate?: { id: string; mandate_name: string; client_name: string };
  contact?: { id: string; name: string };
}

export interface CreatePlannedTaskData {
  title: string;
  description?: string;
  date: string;
  estimated_duration?: number;
  lead_id?: string;
  contact_id?: string;
  operation_id?: string;
  mandate_id?: string;
  target_company_id?: string;
}

export interface CreateTimeEntryData {
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
}

export interface DailyTimeData {
  plannedTasks: PlannedTask[];
  timeEntries: TimeEntry[];
  activeTimer?: TimeEntry;
}

export interface TeamActivityData {
  user_id: string;
  user_name: string;
  active_task?: PlannedTask;
  active_timer?: TimeEntry;
  daily_hours: number;
  tasks_completed: number;
  last_activity?: string;
}
