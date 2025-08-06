import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReminders, REMINDER_CONFIGS } from '../useReminders';
import { AutomationService } from '@/services/automationService';

// Mock AutomationService
vi.mock('@/services/automationService', () => ({
  AutomationService: {
    setQueryClient: vi.fn(),
    onDealStageUpdate: vi.fn(),
    cancelReminder: vi.fn(),
    getActiveReminders: vi.fn()
  }
}));

// Mock useOverdueTasks
vi.mock('@/hooks/useOverdueTasks', () => ({
  useOverdueTasks: () => ({
    refetch: vi.fn()
  })
}));

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: any) => {
    const Provider = QueryClientProvider;
    return { client: queryClient, children };
  };
};

describe('useReminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduleReminder', () => {
    it('should schedule a reminder with default configuration', async () => {
      (AutomationService.onDealStageUpdate as any).mockResolvedValue(undefined);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useReminders());

      result.current.scheduleReminder({
        type: 'NDA_NOT_SIGNED',
        dealId: 'deal-123'
      });

      await waitFor(() => {
        expect(AutomationService.onDealStageUpdate).toHaveBeenCalledWith(
          '',
          'NDA_NOT_SIGNED',
          'deal-123',
          'negocio'
        );
      });
    });

    it('should schedule reminder with custom delay hours', async () => {
      (AutomationService.onDealStageUpdate as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useReminders());

      result.current.scheduleReminder({
        type: 'PROPOSAL_PENDING',
        dealId: 'deal-456',
        delayHours: 72,
        dealType: 'deal'
      });

      await waitFor(() => {
        expect(AutomationService.onDealStageUpdate).toHaveBeenCalledWith(
          '',
          'PROPOSAL_PENDING',
          'deal-456',
          'deal'
        );
      });
    });

    it('should handle scheduling errors', async () => {
      const error = new Error('Scheduling failed');
      (AutomationService.onDealStageUpdate as any).mockRejectedValue(error);

      const { result } = renderHook(() => useReminders());

      result.current.scheduleReminder({
        type: 'NO_ACTIVITY_NEGOTIATION',
        dealId: 'deal-789'
      });

      await waitFor(() => {
        expect(result.current.isScheduling).toBe(false);
      });
    });
  });

  describe('cancelReminder', () => {
    it('should cancel a specific reminder', async () => {
      (AutomationService.cancelReminder as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useReminders());

      result.current.cancelReminder({
        dealId: 'deal-123',
        type: 'NDA_NOT_SIGNED'
      });

      await waitFor(() => {
        expect(AutomationService.cancelReminder).toHaveBeenCalledWith(
          'deal-123',
          'NDA_NOT_SIGNED'
        );
      });
    });
  });

  describe('Quick reminder functions', () => {
    it('should schedule NDA reminder with correct parameters', async () => {
      (AutomationService.onDealStageUpdate as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useReminders());

      result.current.scheduleNDAReminder('deal-123', 'negocio');

      await waitFor(() => {
        expect(AutomationService.onDealStageUpdate).toHaveBeenCalledWith(
          '',
          'NDA_NOT_SIGNED',
          'deal-123',
          'negocio'
        );
      });
    });

    it('should schedule inactivity reminder', async () => {
      (AutomationService.onDealStageUpdate as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useReminders());

      result.current.scheduleInactivityReminder('deal-456');

      await waitFor(() => {
        expect(AutomationService.onDealStageUpdate).toHaveBeenCalledWith(
          '',
          'NO_ACTIVITY_NEGOTIATION',
          'deal-456',
          undefined
        );
      });
    });

    it('should schedule proposal reminder', async () => {
      (AutomationService.onDealStageUpdate as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useReminders());

      result.current.scheduleProposalReminder('deal-789', 'deal');

      await waitFor(() => {
        expect(AutomationService.onDealStageUpdate).toHaveBeenCalledWith(
          '',
          'PROPOSAL_PENDING',
          'deal-789',
          'deal'
        );
      });
    });
  });

  describe('scheduleBulkReminders', () => {
    it('should schedule multiple reminders and return results', async () => {
      (AutomationService.onDealStageUpdate as any).mockResolvedValue(undefined);

      const { result } = renderHook(() => useReminders());

      const reminders = [
        { type: 'NDA_NOT_SIGNED' as const, dealId: 'deal-1' },
        { type: 'PROPOSAL_PENDING' as const, dealId: 'deal-2' },
        { type: 'NO_ACTIVITY_NEGOTIATION' as const, dealId: 'deal-3' }
      ];

      const results = await result.current.scheduleBulkReminders(reminders);

      expect(results).toHaveLength(3);
      expect(AutomationService.onDealStageUpdate).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures in bulk scheduling', async () => {
      (AutomationService.onDealStageUpdate as any)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useReminders());

      const reminders = [
        { type: 'NDA_NOT_SIGNED' as const, dealId: 'deal-1' },
        { type: 'PROPOSAL_PENDING' as const, dealId: 'deal-2' },
        { type: 'NO_ACTIVITY_NEGOTIATION' as const, dealId: 'deal-3' }
      ];

      const results = await result.current.scheduleBulkReminders(reminders);

      expect(results).toHaveLength(3);
      expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(2);
      expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
    });
  });

  describe('useActiveReminders', () => {
    it('should fetch active reminders for a deal', async () => {
      const mockReminders = [
        {
          id: '1',
          task_id: 'deal-123',
          notification_type: 'nda_reminder',
          task_title: 'NDA pendiente',
          message: 'NDA sin firmar',
          read_at: null
        }
      ];

      (AutomationService.getActiveReminders as any).mockResolvedValue(mockReminders);

      const { result } = renderHook(() => useReminders());
      
      const { result: queryResult } = renderHook(
        () => result.current.useActiveReminders('deal-123')
      );

      await waitFor(() => {
        expect(queryResult.current.isSuccess).toBe(true);
      });

      expect(AutomationService.getActiveReminders).toHaveBeenCalledWith('deal-123');
      expect(queryResult.current.data).toEqual(mockReminders);
    });

    it('should not fetch when dealId is empty', () => {
      const { result } = renderHook(() => useReminders());
      
      const { result: queryResult } = renderHook(
        () => result.current.useActiveReminders('')
      );

      expect(queryResult.current.isFetching).toBe(false);
      expect(AutomationService.getActiveReminders).not.toHaveBeenCalled();
    });
  });

  describe('REMINDER_CONFIGS', () => {
    it('should have correct configuration for all reminder types', () => {
      expect(REMINDER_CONFIGS.NDA_NOT_SIGNED).toEqual({
        delayHours: 48,
        message: 'El NDA no ha sido firmado. Seguimiento requerido.'
      });

      expect(REMINDER_CONFIGS.NO_ACTIVITY_NEGOTIATION).toEqual({
        delayHours: 168,
        message: 'Sin actividad en la negociación por más de 7 días.'
      });

      expect(REMINDER_CONFIGS.PROPOSAL_PENDING).toEqual({
        delayHours: 120,
        message: 'La propuesta está pendiente de respuesta hace 5 días.'
      });
    });

    it('should be accessible from hook return', () => {
      const { result } = renderHook(() => useReminders());

      expect(result.current.REMINDER_CONFIGS).toBeDefined();
      expect(Object.keys(result.current.REMINDER_CONFIGS)).toHaveLength(3);
    });
  });

  describe('Loading states', () => {
    it('should track scheduling state correctly', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      (AutomationService.onDealStageUpdate as any).mockReturnValue(promise);

      const { result } = renderHook(() => useReminders());

      expect(result.current.isScheduling).toBe(false);

      result.current.scheduleReminder({
        type: 'NDA_NOT_SIGNED',
        dealId: 'deal-123'
      });

      await waitFor(() => {
        expect(result.current.isScheduling).toBe(true);
      });

      resolvePromise!();

      await waitFor(() => {
        expect(result.current.isScheduling).toBe(false);
      });
    });
  });
});