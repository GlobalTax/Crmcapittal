import { useMemo } from 'react';
import { DailyTimeData } from '@/types/TimeTracking';
import { startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export const useDashboardStats = (dailyData: DailyTimeData, weeklyData: DailyTimeData[] = []) => {
  return useMemo(() => {
    const today = new Date();
    const totalMinutesToday = dailyData.timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    const billableMinutesToday = dailyData.timeEntries
      .filter(entry => entry.is_billable)
      .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    
    const completedTasks = dailyData.plannedTasks.filter(task => task.status === 'COMPLETED').length;
    const totalTasks = dailyData.plannedTasks.length;
    const pendingTasks = dailyData.plannedTasks.filter(task => task.status === 'PENDING').length;
    
    // Weekly calculations
    const weekStart = startOfWeek(today, { locale: es });
    const weekEnd = endOfWeek(today, { locale: es });
    
    const weeklyMinutes = weeklyData.reduce((sum, day) => {
      return sum + day.timeEntries.reduce((daySum, entry) => daySum + (entry.duration_minutes || 0), 0);
    }, 0);
    
    const weeklyBillableMinutes = weeklyData.reduce((sum, day) => {
      return sum + day.timeEntries
        .filter(entry => entry.is_billable)
        .reduce((daySum, entry) => daySum + (entry.duration_minutes || 0), 0);
    }, 0);
    
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const billablePercentage = totalMinutesToday > 0 ? Math.round((billableMinutesToday / totalMinutesToday) * 100) : 0;
    
    return {
      totalMinutesToday,
      billableMinutesToday,
      completedTasks,
      totalTasks,
      pendingTasks,
      weeklyMinutes,
      weeklyBillableMinutes,
      productivityScore,
      billablePercentage,
      dailyGoal: 8 * 60, // 8 hours in minutes
      weeklyGoal: 40 * 60, // 40 hours in minutes
    };
  }, [dailyData, weeklyData]);
};