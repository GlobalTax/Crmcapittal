
import { supabase } from "@/integrations/supabase/client";
import { CreatePlannedTaskData, CreateTimeEntryData, PlannedTask, TimeEntry, DailyTimeData, TeamActivityData } from "@/types/TimeTracking";

export class TimeTrackingService {
  // Planned Tasks Management
  static async createPlannedTask(data: CreatePlannedTaskData): Promise<{ data: PlannedTask | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: task, error } = await supabase
        .from('planned_tasks')
        .insert({
          ...data,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return { data: task, error: null };
    } catch (error) {
      console.error('Error creating planned task:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getPlannedTasksForDate(date: string): Promise<{ data: PlannedTask[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('planned_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching planned tasks:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updatePlannedTaskStatus(taskId: string, status: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('planned_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error updating planned task status:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Time Entry Management
  static async startTimer(plannedTaskId?: string, activityType: string = 'general', description?: string): Promise<{ data: TimeEntry | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user has any active timers
      const { data: activeTimer } = await this.getActiveTimer();
      if (activeTimer) {
        return { data: null, error: 'Ya tienes un temporizador activo. Detén el actual antes de iniciar uno nuevo.' };
      }

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user.id,
          planned_task_id: plannedTaskId,
          activity_type: activityType,
          description,
          start_time: new Date().toISOString(),
          is_billable: true
        })
        .select()
        .single();

      if (error) throw error;
      return { data: timeEntry, error: null };
    } catch (error) {
      console.error('Error starting timer:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async stopTimer(timeEntryId: string): Promise<{ data: TimeEntry | null; error: string | null }> {
    try {
      const endTime = new Date().toISOString();
      
      // Get the time entry to calculate duration
      const { data: timeEntry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', timeEntryId)
        .single();

      if (fetchError) throw fetchError;

      const startTime = new Date(timeEntry.start_time);
      const endTimeDate = new Date(endTime);
      const durationMinutes = Math.round((endTimeDate.getTime() - startTime.getTime()) / (1000 * 60));

      const { data: updatedEntry, error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime,
          duration_minutes: durationMinutes
        })
        .eq('id', timeEntryId)
        .select()
        .single();

      if (error) throw error;
      return { data: updatedEntry, error: null };
    } catch (error) {
      console.error('Error stopping timer:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getActiveTimer(): Promise<{ data: TimeEntry | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching active timer:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createManualTimeEntry(data: CreateTimeEntryData): Promise<{ data: TimeEntry | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate duration if both start and end times are provided
      let durationMinutes: number | undefined;
      if (data.start_time && data.end_time) {
        const startTime = new Date(data.start_time);
        const endTime = new Date(data.end_time);
        durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }

      const { data: timeEntry, error } = await supabase
        .from('time_entries')
        .insert({
          ...data,
          user_id: user.id,
          duration_minutes: durationMinutes,
          is_billable: data.is_billable ?? true
        })
        .select()
        .single();

      if (error) throw error;
      return { data: timeEntry, error: null };
    } catch (error) {
      console.error('Error creating manual time entry:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getTimeEntriesForDate(date: string): Promise<{ data: TimeEntry[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startOfDay = `${date}T00:00:00Z`;
      const endOfDay = `${date}T23:59:59Z`;

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching time entries for date:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Daily Data for Employee View
  static async getDailyTimeData(date: string): Promise<{ data: DailyTimeData | null; error: string | null }> {
    try {
      const [plannedTasksResult, timeEntriesResult, activeTimerResult] = await Promise.all([
        this.getPlannedTasksForDate(date),
        this.getTimeEntriesForDate(date),
        this.getActiveTimer()
      ]);

      if (plannedTasksResult.error) throw new Error(plannedTasksResult.error);
      if (timeEntriesResult.error) throw new Error(timeEntriesResult.error);

      return {
        data: {
          plannedTasks: plannedTasksResult.data,
          timeEntries: timeEntriesResult.data,
          activeTimer: activeTimerResult.data || undefined
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching daily time data:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Team Activity for Manager View
  static async getTeamActivityData(date: string): Promise<{ data: TeamActivityData[]; error: string | null }> {
    try {
      // This would require admin permissions - for now return empty array
      // In a full implementation, you'd check user permissions first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // TODO: Add permission check for admin/manager roles
      // For now, return empty array as this needs manager permissions
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching team activity data:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
