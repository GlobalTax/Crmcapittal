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
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDecimalTime(stats.totalMinutesToday)}</div>
            <div className="space-y-2">
              <Progress value={(stats.totalMinutesToday / stats.dailyGoal) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Meta: {formatDecimalTime(stats.dailyGoal)} ({Math.round((stats.totalMinutesToday / stats.dailyGoal) * 100)}%)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Facturable</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDecimalTime(stats.billableMinutesToday)}</div>
            <div className="space-y-2">
              <Progress value={stats.billablePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.billablePercentage}% del tiempo total
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</div>
            <div className="space-y-2">
              <Progress value={stats.productivityScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.pendingTasks} pendientes
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              {isTimerRunning ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-600">Activo</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-400 rounded-full" />
                  <span className="text-sm font-medium text-muted-foreground">Parado</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isTimerRunning ? 'Timer en ejecución' : 'Timer pausado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Semana Actual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-mono font-semibold">{formatDecimalTime(stats.weeklyMinutes)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Facturable</span>
              <span className="font-mono font-semibold text-green-600">
                {formatDecimalTime(stats.weeklyBillableMinutes)}
              </span>
            </div>
            <Progress value={(stats.weeklyMinutes / stats.weeklyGoal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Meta semanal: {formatDecimalTime(stats.weeklyGoal)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Productividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{stats.productivityScore}%</div>
              <p className="text-sm text-muted-foreground">Score del día</p>
            </div>
            <Progress value={stats.productivityScore} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tareas completadas</span>
              <span>{stats.completedTasks}/{stats.totalTasks}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
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
                .slice(0, 3)
                .map(({ type, minutes }) => (
                  <div key={type} className="flex justify-between items-center">
                    <Badge variant="outline" className="text-xs">
                      {type}
                    </Badge>
                    <span className="font-mono text-sm">{formatTime(minutes)}</span>
                  </div>
                ))}
            </div>
            {dailyData.timeEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay actividad registrada
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};