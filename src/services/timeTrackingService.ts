import { supabase } from "@/integrations/supabase/client";
import { CreatePlannedTaskData, CreateTimeEntryData, PlannedTask, TimeEntry, DailyTimeData, TeamActivityData, TaskStatus } from "@/types/TimeTracking";
import { logger } from "@/utils/logger";

export class TimeTrackingService {
  // Helper method to check if user has admin/manager permissions
  private static async checkUserRole(): Promise<{ hasAdminAccess: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { hasAdminAccess: false, error: 'User not authenticated' };
      }

      const { data: userRole, error } = await supabase
        .rpc('get_user_highest_role', { _user_id: user.id });

      if (error) {
        logger.error('Error fetching user role', { userId: user.id }, error);
        return { hasAdminAccess: false, error: 'Failed to fetch user permissions' };
      }

      const hasAdminAccess = userRole === 'admin' || userRole === 'superadmin';
      return { hasAdminAccess };
    } catch (error) {
      logger.error('Error in checkUserRole', {}, error instanceof Error ? error : new Error(String(error)));
      return { hasAdminAccess: false, error: 'Permission check failed' };
    }
  }
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
      logger.error('Error creating planned task', {}, error instanceof Error ? error : new Error(String(error)));
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
      logger.error('Error fetching planned tasks', {}, error instanceof Error ? error : new Error(String(error)));
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updatePlannedTaskStatus(taskId: string, status: TaskStatus): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('planned_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('Error updating planned task status', { taskId }, error instanceof Error ? error : new Error(String(error)));
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
      logger.error('Error starting timer', { plannedTaskId, activityType }, error instanceof Error ? error : new Error(String(error)));
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
      logger.error('Error stopping timer', { timeEntryId }, error instanceof Error ? error : new Error(String(error)));
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getActiveTimer(): Promise<{ data: TimeEntry | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('getActiveTimer: Fetching active timer for user:', user.id);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('getActiveTimer: Query result:', { data, error });

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      logger.error('Error fetching active timer', {}, error instanceof Error ? error : new Error(String(error)));
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
      logger.error('Error creating manual time entry', {}, error instanceof Error ? error : new Error(String(error)));
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getTimeEntriesForDate(date: string): Promise<{ data: TimeEntry[]; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startOfDay = `${date}T00:00:00Z`;
      const endOfDay = `${date}T23:59:59Z`;

      console.log('getTimeEntriesForDate: Fetching entries for date:', date, 'user:', user.id);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: false });

      console.log('getTimeEntriesForDate: Query result:', { data, error, count: data?.length });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      logger.error('Error fetching time entries for date', { date }, error instanceof Error ? error : new Error(String(error)));
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
      logger.error('Error fetching daily time data', { date }, error instanceof Error ? error : new Error(String(error)));
      return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Team Activity for Manager View
  static async getTeamActivityData(date: string): Promise<{ data: TeamActivityData[]; error: string | null }> {
    try {
      // Check user permissions first
      const { hasAdminAccess, error: roleError } = await this.checkUserRole();
      if (roleError) {
        return { data: [], error: roleError };
      }

      if (!hasAdminAccess) {
        logger.warn('Unauthorized access attempt to team activity data');
        return { data: [], error: 'Acceso denegado. Se requieren permisos de administrador.' };
      }

      const startOfDay = `${date}T00:00:00Z`;
      const endOfDay = `${date}T23:59:59Z`;

      // Fetch all team members' data
      const { data: teamData, error } = await supabase
        .from('time_entries')
        .select(`
          user_id,
          start_time,
          end_time,
          duration_minutes,
          activity_type,
          planned_task_id,
          planned_tasks!inner(
            title,
            status
          )
        `)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: false });

      if (error) throw error;

      // Get user profiles for team members
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name');

      if (profilesError) throw profilesError;

      // Group data by user and calculate metrics
      const teamActivityMap = new Map<string, TeamActivityData>();

      teamData?.forEach(entry => {
        const userId = entry.user_id;
        const profile = profiles?.find(p => p.id === userId);
        const userName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Usuario desconocido';

        if (!teamActivityMap.has(userId)) {
          teamActivityMap.set(userId, {
            user_id: userId,
            user_name: userName,
            daily_hours: 0,
            tasks_completed: 0,
            last_activity: entry.start_time
          });
        }

        const userData = teamActivityMap.get(userId)!;
        
        // Add hours if entry is completed
        if (entry.duration_minutes) {
          userData.daily_hours += entry.duration_minutes / 60;
        }

        // Count completed tasks
        if (entry.planned_tasks?.status === 'COMPLETED') {
          userData.tasks_completed += 1;
        }

        // Set active task if entry is ongoing
        if (!entry.end_time) {
          userData.active_timer = {
            id: entry.user_id, // This would need proper time entry ID in real implementation
            user_id: entry.user_id,
            activity_type: entry.activity_type,
            start_time: entry.start_time,
            planned_task_id: entry.planned_task_id,
            is_billable: true,
            created_at: entry.start_time,
            updated_at: entry.start_time
          };
        }

        // Update last activity time
        if (entry.start_time > (userData.last_activity || '')) {
          userData.last_activity = entry.start_time;
        }
      });

      return { data: Array.from(teamActivityMap.values()), error: null };
    } catch (error) {
      logger.error('Error fetching team activity data', { date }, error instanceof Error ? error : new Error(String(error)));
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
