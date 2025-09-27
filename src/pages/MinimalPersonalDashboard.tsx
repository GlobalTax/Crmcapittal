import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle, User, TrendingUp, Clock, Euro } from "lucide-react";
import { CompactMetricCard } from "@/components/personal/CompactMetricCard";
import { MiniTimer } from "@/components/personal/MiniTimer";
import { QuickActionsBar } from "@/components/personal/QuickActionsBar";
import { UpcomingMeetings } from "@/components/personal/UpcomingMeetings";
import { CompactActivityFeed } from "@/components/personal/CompactActivityFeed";
import { TaskModal } from "@/components/personal/TaskModal";
import { usePersonalMetrics } from "@/hooks/usePersonalMetrics";

export default function MinimalPersonalDashboard() {
  const { user } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const metrics = usePersonalMetrics();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="h-full flex flex-col">
        {/* Header con acciones rápidas */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard Personal</h1>
          </div>
          <div className="flex items-center gap-3">
            <QuickActionsBar 
              onNewTask={() => setIsTaskModalOpen(true)}
              onNewLead={() => (window.location.href = '/leads/new')}
            />
            <MiniTimer />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pb-6 space-y-6">
          {/* Main KPIs */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            <CompactMetricCard
              title="Tareas Hoy"
              value={metrics.tasksToday.total}
              icon={CheckCircle}
              progress={{
                current: metrics.tasksToday.completed,
                total: metrics.tasksToday.total
              }}
            />
            <CompactMetricCard
              title="Leads Activos"
              value={metrics.activeLeads}
              icon={User}
              change={{ value: 12, isPositive: true }}
            />
            <CompactMetricCard
              title="Revenue Pipeline"
              value={`€${(metrics.revenuePipeline / 1000).toFixed(0)}K`}
              icon={Euro}
              change={{ value: 5, isPositive: true }}
            />
            <CompactMetricCard
              title="Tiempo Productivo"
              value={`${metrics.productiveTime}h`}
              icon={Clock}
            />
          </div>

          {/* Secondary Content Grid - Mejor distribución del espacio */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 flex-1">
            <div className="lg:col-span-4 xl:col-span-3">
              <UpcomingMeetings />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              <CompactActivityFeed />
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
      />
    </div>
  );
}