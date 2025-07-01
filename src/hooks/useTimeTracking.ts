
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackingService } from '@/services/timeTrackingService';
import { CreatePlannedTaskData, CreateTimeEntryData, DailyTimeData, TimeEntry } from '@/types/TimeTracking';

export const useTimeTracking = (date: string) => {
  const queryClient = useQueryClient();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch daily time data with proper error handling and caching
  const { data: dailyData, isLoading, error } = useQuery({
    queryKey: ['dailyTimeData', date],
    queryFn: async () => {
      try {
        const result = await TimeTrackingService.getDailyTimeData(date);
        return result.data;
      } catch (err) {
        console.error('Error fetching daily time data:', err);
        throw err;
      }
    },
    refetchInterval: (data) => {
      // Only refetch if there's an active timer
      return data?.activeTimer ? 30000 : false;
    },
    refetchOnWindowFocus: false,
    staleTime: 15000, // Consider data fresh for 15 seconds
    retry: (failureCount, error: any) => {
      // Don't retry on authentication errors
      if (error?.status === 403 || error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Update timer state when data changes
  useEffect(() => {
    const hasActiveTimer = !!dailyData?.activeTimer;
    if (isTimerRunning !== hasActiveTimer) {
      setIsTimerRunning(hasActiveTimer);
    }
  }, [dailyData?.activeTimer, isTimerRunning]);

  // Create planned task mutation
  const createPlannedTaskMutation = useMutation({
    mutationFn: (data: CreatePlannedTaskData) => TimeTrackingService.createPlannedTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
    },
    onError: (error) => {
      console.error('Error creating planned task:', error);
    }
  });

  // Start timer mutation
  const startTimerMutation = useMutation({
    mutationFn: ({ plannedTaskId, activityType, description }: { 
      plannedTaskId?: string; 
      activityType?: string; 
      description?: string; 
    }) => TimeTrackingService.startTimer(plannedTaskId, activityType, description),
    onSuccess: (result) => {
      if (result.data) {
        setIsTimerRunning(true);
        queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
      }
    },
    onError: (error) => {
      console.error('Error starting timer:', error);
    }
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: (timeEntryId: string) => TimeTrackingService.stopTimer(timeEntryId),
    onSuccess: () => {
      setIsTimerRunning(false);
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
    },
    onError: (error) => {
      console.error('Error stopping timer:', error);
    }
  });

  // Create manual time entry mutation
  const createManualEntryMutation = useMutation({
    mutationFn: (data: CreateTimeEntryData) => TimeTrackingService.createManualTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
    },
    onError: (error) => {
      console.error('Error creating manual entry:', error);
    }
  });

  // Memoize helper functions to prevent unnecessary re-renders
  const startTimer = useCallback(async (plannedTaskId?: string, activityType: string = 'general', description?: string) => {
    try {
      const result = await startTimerMutation.mutateAsync({ plannedTaskId, activityType, description });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      console.error('Start timer error:', error);
      throw error;
    }
  }, [startTimerMutation]);

  const stopTimer = useCallback(async () => {
    if (!dailyData?.activeTimer) {
      throw new Error('No hay temporizador activo');
    }
    try {
      const result = await stopTimerMutation.mutateAsync(dailyData.activeTimer.id);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      console.error('Stop timer error:', error);
      throw error;
    }
  }, [stopTimerMutation, dailyData?.activeTimer]);

  const createPlannedTask = useCallback(async (data: CreatePlannedTaskData) => {
    try {
      const result = await createPlannedTaskMutation.mutateAsync(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      console.error('Create planned task error:', error);
      throw error;
    }
  }, [createPlannedTaskMutation]);

  const createManualEntry = useCallback(async (data: CreateTimeEntryData) => {
    try {
      const result = await createManualEntryMutation.mutateAsync(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    } catch (error) {
      console.error('Create manual entry error:', error);
      throw error;
    }
  }, [createManualEntryMutation]);

  // Calculate elapsed time for active timer
  const getElapsedTime = useCallback((): number => {
    if (!dailyData?.activeTimer) return 0;
    const startTime = new Date(dailyData.activeTimer.start_time);
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / 1000); // Return seconds
  }, [dailyData?.activeTimer]);

  return {
    // Data
    dailyData,
    isLoading,
    error,
    isTimerRunning,
    
    // Actions
    startTimer,
    stopTimer,
    createPlannedTask,
    createManualEntry,
    getElapsedTime,
    
    // Loading states
    isStartingTimer: startTimerMutation.isPending,
    isStoppingTimer: stopTimerMutation.isPending,
    isCreatingTask: createPlannedTaskMutation.isPending,
    isCreatingEntry: createManualEntryMutation.isPending,
  };
};
