import { useState } from "react";
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { useLeads } from "@/hooks/useLeads";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { User, Briefcase, Mail } from "lucide-react";

export default function MinimalPersonalDashboard() {
  const { user } = useAuth();
  const { leads } = useLeads({ assigned_to_id: user?.id });
  const { tasks, getTodayTasks, getCompletedTasks } = usePersonalTasks();
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const todayTasks = getTodayTasks();
  const completedTasks = getCompletedTasks();

  const stats = [
    { label: "Tareas Pendientes", value: todayTasks.length, icon: <User className="w-5 h-5" /> },
    { label: "Leads Asignados", value: leads.length, icon: <Briefcase className="w-5 h-5" /> },
    { label: "Completadas Hoy", value: completedTasks.length, icon: <Mail className="w-5 h-5" /> }
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
          <div key={index} className="bg-white rounded-lg p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="text-gray-400">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tareas del Día */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Tareas del Día</h3>
          </div>
          <div className="p-4 space-y-3">
            <Button variant="secondary" className="w-full">
              + Nueva Tarea
            </Button>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>¡No hay tareas pendientes!</p>
                </div>
              ) : (
                todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded">
                    <button className="text-green-600">
                      ✓
                    </button>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-500">{task.description}</p>
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
        </div>

        {/* Leads Asignados */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Leads Asignados</h3>
          </div>
          <div className="p-4 space-y-3">
            {leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p>No tienes leads asignados</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium text-sm">{lead.name}</h4>
                      <p className="text-xs text-gray-500">{lead.company_name || 'Sin empresa'}</p>
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
        </div>
      </div>

      {/* Timer & Activity */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Actividad Reciente</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Tarea completada: Llamar a Juan Pérez</p>
              <p className="text-xs text-gray-500">Hace 2 horas</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Lead convertido: María García</p>
              <p className="text-xs text-gray-500">Hace 4 horas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}