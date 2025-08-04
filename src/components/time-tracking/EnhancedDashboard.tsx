import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  Timer, 
  DollarSign, 
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';
import { DailyTimeData } from '@/types/TimeTracking';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

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
  
  const stats = useMemo(() => {
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDecimalTime = (minutes: number) => {
    return (minutes / 60).toFixed(1) + 'h';
  };

  return (
    <div className="space-y-8">
      {/* Primary Stats - Minimalist */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{formatDecimalTime(stats.totalMinutesToday)}</div>
          <div className="text-sm text-muted-foreground">Tiempo hoy</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{formatDecimalTime(stats.billableMinutesToday)}</div>
          <div className="text-sm text-muted-foreground">Facturable</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
          <div className="text-sm text-muted-foreground">Tareas</div>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {isTimerRunning ? (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            ) : (
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
            )}
            <div className="text-2xl font-bold">{isTimerRunning ? 'ON' : 'OFF'}</div>
          </div>
          <div className="text-sm text-muted-foreground">Timer</div>
        </div>
      </div>

      {/* Activity Summary - Minimal */}
      {dailyData.timeEntries.length > 0 && (
        <div className="p-4 border rounded-lg">
          <div className="text-sm font-medium mb-3">Actividad del día</div>
          <div className="space-y-2">
            {dailyData.timeEntries
              .reduce((acc, entry) => {
                const type = entry.activity_type;
                const existing = acc.find(item => item.type === type);
                if (existing) {
                  existing.minutes += entry.duration_minutes || 0;
                } else {
                  acc.push({ type, minutes: entry.duration_minutes || 0 });
                }
                return acc;
              }, [] as Array<{ type: string; minutes: number }>)
              .sort((a, b) => b.minutes - a.minutes)
              .slice(0, 5)
              .map(({ type, minutes }) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="capitalize">{type}</span>
                  <span className="font-mono">{formatTime(minutes)}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};