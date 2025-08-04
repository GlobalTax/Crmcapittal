import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Briefcase, CheckCircle, TrendingUp, Calendar, Activity } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { WorkTimer } from "@/components/dashboard/WorkTimer";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { AgendaPanel } from "@/components/dashboard/AgendaPanel";
import { DashboardLeads } from "@/components/dashboard/DashboardLeads";

export default function MinimalPersonalDashboard() {
  const { user } = useAuth();
  const { leads } = useLeads({ owner_id: user?.id });
  const { tasks, getTodayTasks, getCompletedTasks } = usePersonalTasks();

  const todayTasks = getTodayTasks();
  const completedTasks = getCompletedTasks();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            ¡Hola, {user?.user_metadata?.first_name || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground text-lg">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
            {completedTasks.length} completadas hoy
          </div>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <MetricCard
          title="Tareas Pendientes"
          value={todayTasks.length}
          change={{ value: "2", trend: "down" }}
          icon={CheckCircle}
        />
        <MetricCard
          title="Leads Asignados"
          value={leads.length}
          change={{ value: "5", trend: "up" }}
          icon={User}
        />
        <MetricCard
          title="Negocios Activos"
          value="12"
          change={{ value: "8%", trend: "up" }}
          icon={TrendingUp}
        />
        <MetricCard
          title="Reuniones Hoy"
          value="4"
          icon={Calendar}
        />
      </div>

      {/* Second Row - Timer and Quick Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WorkTimer />
        </div>
        <div className="lg:col-span-2">
          <AgendaPanel />
        </div>
      </div>

      {/* Leads Dashboard Section */}
      <DashboardLeads />

      {/* Third Row - Activity and Tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed />
        
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Tareas del Día</h3>
            <Button size="sm">
              + Nueva Tarea
            </Button>
          </div>
          
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-medium text-card-foreground mb-1">¡No hay tareas pendientes!</h4>
                <p className="text-sm text-muted-foreground">Disfruta de tu día libre de tareas</p>
              </div>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <button className="w-5 h-5 rounded border-2 border-success hover:bg-success hover:text-success-foreground transition-colors">
                    <CheckCircle className="w-3 h-3" />
                  </button>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-card-foreground">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                    task.priority === 'high' ? 'bg-warning/10 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {task.priority}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}