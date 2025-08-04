import React from 'react';
import { DailyTimeData } from '@/types/TimeTracking';
import { DashboardMetrics } from './dashboard/DashboardMetrics';
import { DashboardActivity } from './dashboard/DashboardActivity';
import { useDashboardStats } from './dashboard/useDashboardStats';

interface EnhancedDashboardProps {
  dailyData: DailyTimeData;
  isTimerRunning: boolean;
  weeklyData?: DailyTimeData[];
}

export const EnhancedDashboard = ({ 
  dailyData, 
  isTimerRunning,
  weeklyData = []
}: EnhancedDashboardProps) => {
  const stats = useDashboardStats(dailyData, weeklyData);

  return (
    <div className="space-y-8">
      <DashboardMetrics
        totalMinutesToday={stats.totalMinutesToday}
        billableMinutesToday={stats.billableMinutesToday}
        completedTasks={stats.completedTasks}
        totalTasks={stats.totalTasks}
        isTimerRunning={isTimerRunning}
      />
      
      <DashboardActivity dailyData={dailyData} />
    </div>
  );
};