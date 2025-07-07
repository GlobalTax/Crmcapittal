import { useState } from "react";
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { FloatingLeadsWidget } from '@/components/leads/FloatingLeadsWidget';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Briefcase, Mail, CheckCircle } from "lucide-react";

export default function MinimalPersonalDashboard() {
  const { user } = useAuth();
  const { leads } = useLeads({ assigned_to_id: user?.id });
  const { tasks, getTodayTasks, getCompletedTasks } = usePersonalTasks();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const todayTasks = getTodayTasks();
  const completedTasks = getCompletedTasks();

  const stats = [
    { label: "Tareas Pendientes", value: todayTasks.length, icon: User },
    { label: "Leads Asignados", value: leads.length, icon: Briefcase },
    { label: "Completadas Hoy", value: completedTasks.length, icon: Mail }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            ¡Hola, {user?.user_metadata?.first_name || 'Usuario'}!
          </h1>
          <p className="text-gray-600">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
        <Badge color="green">
          {completedTasks.length} completadas hoy
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <DashboardCard
            key={index}
            title={stat.label}
            metric={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tareas del Día */}
        <DashboardCard title="Tareas del Día" icon={CheckCircle}>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full">
              + Nueva Tarea
            </Button>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todayTasks.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="¡No hay tareas pendientes!"
                  subtitle="Disfruta de tu día libre de tareas"
                />
              ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded">
                    <button className="text-success">
                      ✓
                    </button>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                    <Badge color={task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'yellow' : 'gray'}>
                      {task.priority}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Leads Asignados */}
        <DashboardCard title="Leads Asignados" icon={User}>
          <div className="space-y-3">
            {leads.length === 0 ? (
              <EmptyState
                icon={User}
                title="No tienes leads asignados"
                subtitle="Los leads aparecerán aquí cuando te los asignen"
              />
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.company_name || 'Sin empresa'}</p>
                    </div>
                    <Badge color="blue">
                      {lead.status}
                    </Badge>
                  </div>
                ))}
                
                {leads.length > 5 && (
                  <Button variant="secondary" className="w-full">
                    Ver todos ({leads.length})
                  </Button>
                )}
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Timer & Activity */}
      <DashboardCard title="Actividad Reciente">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Tarea completada: Llamar a Juan Pérez</p>
              <p className="text-xs text-muted-foreground">Hace 2 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Lead convertido: María García</p>
              <p className="text-xs text-muted-foreground">Hace 4 horas</p>
            </div>
          </div>
        </div>
      </DashboardCard>
      
      {/* Floating Leads Widget */}
      <FloatingLeadsWidget />
    </div>
  );
}