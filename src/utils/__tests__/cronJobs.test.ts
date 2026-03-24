import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CronJobsService } from '../cronJobs';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        })
      }),
      insert: vi.fn().mockResolvedValue({ error: null })
    }),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { success: true }, error: null })
    }
  }
}));

const { supabase } = await import('@/integrations/supabase/client');

describe('CronJobsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('checkPendingReminders', () => {
    it('should fetch overdue tasks and filter reminder tasks', async () => {
      const mockOverdueTasks = [
        {
          task_id: '1',
          task_title: 'Recordatorio: NDA pendiente',
          task_type: 'negocio',
          entity_id: 'deal-1',
          entity_name: 'Test Deal',
          days_overdue: 2
        },
        {
          task_id: '2', 
          task_title: 'Regular task',
          task_type: 'planned',
          entity_id: 'task-2',
          entity_name: 'Regular Task',
          days_overdue: 1
        }
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockOverdueTasks,
        error: null
      });

      const result = await CronJobsService.checkPendingReminders();

      expect(supabase.rpc).toHaveBeenCalledWith('get_all_overdue_tasks');
      expect(result).toHaveLength(1);
      expect(result[0].task_title).toBe('Recordatorio: NDA pendiente');
      expect(result[0].notification_type).toBe('nda_reminder');
    });

    it('should handle RPC errors gracefully', async () => {
      (supabase.rpc as any).mockResolvedValue({
        data: null,
        error: new Error('Database error')
      });

      await expect(CronJobsService.checkPendingReminders()).rejects.toThrow('Database error');
    });
  });

  describe('processReminderNotifications', () => {
    it('should create notifications for pending reminders', async () => {
      const mockReminders = [
        {
          id: '1',
          task_id: 'deal-1',
          task_type: 'negocio',
          notification_type: 'nda_reminder',
          task_title: 'NDA pendiente',
          entity_name: 'Test Deal',
          entity_id: 'deal-1',
          message: 'Recordatorio: NDA pendiente',
          days_overdue: 2,
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            })
          })
        }),
        insert: vi.fn().mockResolvedValue({ error: null })
      });

      await CronJobsService.processReminderNotifications(mockReminders);

      expect(supabase.from).toHaveBeenCalledWith('task_notifications');
    });
  });

  describe('triggerHourlyCheck', () => {
    it('should invoke the task-reminders-cron Edge Function', async () => {
      await CronJobsService.triggerHourlyCheck();

      expect(supabase.functions.invoke).toHaveBeenCalledWith('task-reminders-cron', {
        body: { type: 'hourly_check' }
      });
    });

    it('should handle Edge Function errors', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: new Error('Function error')
      });

      await expect(CronJobsService.triggerHourlyCheck()).rejects.toThrow('Function error');
    });
  });

  describe('scheduleManualCheck', () => {
    it('should run complete reminder check flow', async () => {
      const mockOverdueTasks = [
        {
          task_id: '1',
          task_title: 'Recordatorio: Propuesta pendiente',
          task_type: 'negocio',
          entity_id: 'deal-1',
          entity_name: 'Test Deal',
          days_overdue: 5
        }
      ];

      (supabase.rpc as any).mockResolvedValue({
        data: mockOverdueTasks,
        error: null
      });

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null })
              })
            })
          })
        }),
        insert: vi.fn().mockResolvedValue({ error: null })
      });

      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true },
        error: null
      });

      const result = await CronJobsService.scheduleManualCheck();

      expect(result).toHaveLength(1);
      expect(result[0].notification_type).toBe('proposal_reminder');
      expect(supabase.rpc).toHaveBeenCalledWith('get_all_overdue_tasks');
      expect(supabase.functions.invoke).toHaveBeenCalledWith('task-reminders-cron', {
        body: { type: 'hourly_check' }
      });
    });
  });

  describe('getReminderStats', () => {
    it('should return reminder statistics', async () => {
      const mockNotifications = [
        { notification_type: 'nda_reminder', days_overdue: 1, read_at: null },
        { notification_type: 'nda_reminder', days_overdue: 0, read_at: null },
        { notification_type: 'inactivity_reminder', days_overdue: 3, read_at: null },
        { notification_type: 'proposal_reminder', days_overdue: 0, read_at: '2024-01-01T00:00:00Z' }
      ];

      (supabase.from as any).mockReturnValue({
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockResolvedValue({ data: mockNotifications, error: null })
        })
      });

      const stats = await CronJobsService.getReminderStats();

      expect(stats.total).toBe(3); // Only unread
      expect(stats.byType).toEqual({
        'nda_reminder': 2,
        'inactivity_reminder': 1
      });
      expect(stats.overdue).toBe(2); // Only those with days_overdue > 0
    });
  });

  describe('Reminder type inference', () => {
    it('should correctly infer notification types from task titles', async () => {
      const testCases = [
        { title: 'Recordatorio: NDA pendiente', expected: 'nda_reminder' },
        { title: 'Sin actividad en negociación', expected: 'inactivity_reminder' },
        { title: 'Propuesta pendiente de respuesta', expected: 'proposal_reminder' },
        { title: 'Generic task', expected: 'task_reminder' }
      ];

      for (const testCase of testCases) {
        const mockTasks = [{
          task_id: '1',
          task_title: testCase.title,
          task_type: 'negocio',
          entity_id: 'deal-1',
          entity_name: 'Test Deal',
          days_overdue: 1
        }];

        (supabase.rpc as any).mockResolvedValueOnce({
          data: mockTasks,
          error: null
        });

        const result = await CronJobsService.checkPendingReminders();
        expect(result[0]).toBeDefined();
        expect(result[0].notification_type).toBe(testCase.expected);
      }
    });
  });

  describe('Timing and delays', () => {
    it('should respect fake timers for time-based operations', async () => {
      const startTime = Date.now();
      
      // Fast forward time by 2 hours
      vi.advanceTimersByTime(2 * 60 * 60 * 1000);
      
      const endTime = Date.now();
      expect(endTime - startTime).toBe(2 * 60 * 60 * 1000);
    });
  });
});