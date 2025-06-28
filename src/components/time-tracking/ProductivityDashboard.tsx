
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, TrendingUp, DollarSign } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';

export const ProductivityDashboard = () => {
  const { timeGoals, getTimeStats } = useTimeTracking();
  const stats = getTimeStats();

  const dailyGoal = timeGoals.find(goal => goal.goal_type === 'daily');
  const weeklyGoal = timeGoals.find(goal => goal.goal_type === 'weekly');
  const monthlyGoal = timeGoals.find(goal => goal.goal_type === 'monthly');

  const calculateProgress = (actual: number, target: number) => {
    return Math.min((actual / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoy</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}h</div>
            <p className="text-xs text-muted-foreground">
              Facturable: {stats.billableToday}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.week}h</div>
            {weeklyGoal && (
              <Progress 
                value={calculateProgress(stats.week, weeklyGoal.target_hours)} 
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.month}h</div>
            {monthlyGoal && (
              <Progress 
                value={calculateProgress(stats.month, monthlyGoal.target_hours)} 
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.today > 0 ? Math.round((stats.billableToday / stats.today) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo facturable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Objetivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyGoal && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Objetivo Diario</span>
                <span>{stats.today}h / {dailyGoal.target_hours}h</span>
              </div>
              <Progress value={calculateProgress(stats.today, dailyGoal.target_hours)} />
            </div>
          )}

          {weeklyGoal && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Objetivo Semanal</span>
                <span>{stats.week}h / {weeklyGoal.target_hours}h</span>
              </div>
              <Progress value={calculateProgress(stats.week, weeklyGoal.target_hours)} />
            </div>
          )}

          {monthlyGoal && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Objetivo Mensual</span>
                <span>{stats.month}h / {monthlyGoal.target_hours}h</span>
              </div>
              <Progress value={calculateProgress(stats.month, monthlyGoal.target_hours)} />
            </div>
          )}

          {timeGoals.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No hay objetivos configurados. Crea objetivos para ver tu progreso.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
