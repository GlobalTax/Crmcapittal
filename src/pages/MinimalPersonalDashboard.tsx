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
    <div className="space-y-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">

      {/* Main Content */}
      <div className="p-6 space-y-4">
        {/* Acciones rápidas y temporizador (sin encabezado) */}
        <div className="flex items-center justify-end mb-4">
          <div className="flex items-center gap-3">
            <QuickActionsBar 
              onNewTask={() => setIsTaskModalOpen(true)}
              onNewLead={() => (window.location.href = '/leads/new')}
            />
            <MiniTimer />
          </div>
        </div>
        {/* Main KPIs */}
        <div className="grid gap-4 md:grid-cols-4">
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

        {/* Secondary Content Grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          <UpcomingMeetings />
          <div className="lg:col-span-2">
            <CompactActivityFeed />
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