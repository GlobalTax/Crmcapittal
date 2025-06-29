
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTrackingService } from '@/services/timeTrackingService';
import { CreatePlannedTaskData, CreateTimeEntryData, DailyTimeData, TimeEntry } from '@/types/TimeTracking';

export const useTimeTracking = (date: string) => {
  const queryClient = useQueryClient();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch daily time data
  const { data: dailyData, isLoading, error } = useQuery({
    queryKey: ['dailyTimeData', date],
    queryFn: () => TimeTrackingService.getDailyTimeData(date),
    select: (result) => result.data,
    refetchInterval: 30000, // Refetch every 30 seconds to keep data fresh
  });

  // Check if timer is active on component mount
  useEffect(() => {
    setIsTimerRunning(!!dailyData?.activeTimer);
  }, [dailyData?.activeTimer]);

  // Create planned task mutation
  const createPlannedTaskMutation = useMutation({
    mutationFn: (data: CreatePlannedTaskData) => TimeTrackingService.createPlannedTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
    },
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
  });

  // Stop timer mutation
  const stopTimerMutation = useMutation({
    mutationFn: (timeEntryId: string) => TimeTrackingService.stopTimer(timeEntryId),
    onSuccess: () => {
      setIsTimerRunning(false);
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
    },
  });

  // Create manual time entry mutation
  const createManualEntryMutation = useMutation({
    mutationFn: (data: CreateTimeEntryData) => TimeTrackingService.createManualTimeEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyTimeData', date] });
    },
  });

  // Helper functions
  const startTimer = async (plannedTaskId?: string, activityType: string = 'general', description?: string) => {
    const result = await startTimerMutation.mutateAsync({ plannedTaskId, activityType, description });
    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  };

  const stopTimer = async () => {
    if (!dailyData?.activeTimer) {
      throw new Error('No hay temporizador activo');
    }
    const result = await stopTimerMutation.mutateAsync(dailyData.activeTimer.id);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  };

  const createPlannedTask = async (data: CreatePlannedTaskData) => {
    const result = await createPlannedTaskMutation.mutateAsync(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  };

  const createManualEntry = async (data: CreateTimeEntryData) => {
    const result = await createManualEntryMutation.mutateAsync(data);
    if (result.error) {
      throw new Error(result.error);
    }
    return result.data;
  };

  // Calculate elapsed time for active timer
  const getElapsedTime = (): number => {
    if (!dailyData?.activeTimer) return 0;
    const startTime = new Date(dailyData.activeTimer.start_time);
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / 1000); // Return seconds
  };

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
