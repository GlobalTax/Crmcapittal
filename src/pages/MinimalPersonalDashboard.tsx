import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { UltraCompactMetricCard } from "@/components/personal/UltraCompactMetricCard";
import { PriorityActionsList } from "@/components/personal/PriorityActionsList";
import { CompactAgenda } from "@/components/personal/CompactAgenda";
import { InlineActivityFeed } from "@/components/personal/InlineActivityFeed";
import { QuickStatsBar } from "@/components/personal/QuickStatsBar";
import { MiniTimer } from "@/components/personal/MiniTimer";
import { QuickActionsBar } from "@/components/personal/QuickActionsBar";
import { TaskModal } from "@/components/personal/TaskModal";
import { usePersonalMetrics } from "@/hooks/usePersonalMetrics";
import { usePersonalTasks } from "@/hooks/usePersonalTasks";
import { useLeads } from "@/hooks/useLeads";

export default function MinimalPersonalDashboard() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const metrics = usePersonalMetrics();
  const { tasks } = usePersonalTasks();
  const { leads } = useLeads();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // Mock data for demonstration
  const hotLeads = leads.filter(lead => lead.lead_score && lead.lead_score > 75).length;
  const upcomingDeals = 3; // Mock data
  const pipelineValue = metrics.revenuePipeline;
  
  const priorityActions = tasks.slice(0, 6).map(task => ({
    id: task.id,
    title: task.title,
    dueDate: task.due_date ? new Date(task.due_date) : undefined,
    completed: task.completed,
    type: 'task' as const,
    urgent: task.priority === 'urgent',
    owner: { name: 'Tú' }
  }));

  const agendaItems = [
    { id: '1', title: 'Reunión con Inversiones XYZ', time: new Date(Date.now() + 2 * 60 * 60 * 1000), type: 'meeting' as const, duration: 60 },
    { id: '2', title: 'Llamada Tech Solutions', time: new Date(Date.now() + 4 * 60 * 60 * 1000), type: 'call' as const, duration: 30 }
  ];

  const recentActivities = [
    { id: '1', message: 'Nuevo lead: María González - Tech Solutions', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'lead' as const },
    { id: '2', message: 'Negocio movido a "Propuesta Enviada" - €250.000', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'deal' as const },
    { id: '3', message: 'Tarea completada: Llamar a cliente potencial', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), type: 'task' as const }
  ];

  const quickStats = [
    { label: 'leads activos', value: leads.length, onClick: () => window.location.href = '/leads' },
    { label: 'propuestas enviadas', value: 12, onClick: () => window.location.href = '/proposals' },
    { label: 'nuevos contactos', value: 3, onClick: () => window.location.href = '/contacts' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Personal</h1>
          <div className="flex items-center gap-3">
            <QuickActionsBar 
              onNewTask={() => setIsTaskModalOpen(true)}
              onNewLead={() => window.location.href = '/leads/new'} 
            />
            <MiniTimer />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Ultra-Compact Metrics - 4 Critical Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <UltraCompactMetricCard
            title={`${metrics.tasksToday.total} pendientes`}
            value=""
            progress={{
              current: metrics.tasksToday.completed,
              total: metrics.tasksToday.total
            }}
          />
          
          <UltraCompactMetricCard
            title="En negociación"
            value={`€${(pipelineValue / 1000000).toFixed(1)}M`}
            trend={{ value: "↗ +15%", isPositive: true }}
            subtitle="Pipeline Valor"
          />
          
          <UltraCompactMetricCard
            title={`${hotLeads} leads calientes`}
            value=""
            subtitle="Requieren atención"
            indicator={<div className="w-2 h-2 bg-red-500 rounded-full" />}
            onClick={() => window.location.href = '/leads'}
          />
          
          <UltraCompactMetricCard
            title={`${upcomingDeals} deals`}
            value=""
            subtitle="Próximos 7 días"
          />
        </div>

        {/* Main Layout 70/30 */}
        <div className="grid gap-6 lg:grid-cols-10">
          {/* Left Column - Priority Actions (70%) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Acciones Prioritarias</h3>
            <PriorityActionsList
              actions={priorityActions}
              onToggleComplete={(id) => console.log('Toggle task:', id)}
              onQuickCall={(id) => console.log('Quick call:', id)}
              onQuickEmail={(id) => console.log('Quick email:', id)}
            />
          </div>

          {/* Right Column - Agenda + Activity (30%) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h4 className="text-base font-semibold text-slate-900 mb-3">Agenda Hoy</h4>
              <CompactAgenda items={agendaItems} />
            </div>
            
            <div>
              <h4 className="text-base font-semibold text-slate-900 mb-3">Actividad Reciente</h4>
              <InlineActivityFeed activities={recentActivities} />
            </div>
          </div>
        </div>

        {/* Quick Stats Inline */}
        <QuickStatsBar stats={quickStats} />
      </div>

      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
      />
    </div>
  );
}