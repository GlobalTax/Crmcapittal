import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/minimal/Badge';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PersonalKpiCards } from '@/components/personal/PersonalKpiCards';
import { PersonalTasksPanel } from '@/components/personal/PersonalTasksPanel';
import { PersonalCalendarPanel } from '@/components/personal/PersonalCalendarPanel';
import { PersonalPipelinePanel } from '@/components/personal/PersonalPipelinePanel';
import { PersonalActivityPanel } from '@/components/personal/PersonalActivityPanel';
import { PersonalQuickActionsPanel } from '@/components/personal/PersonalQuickActionsPanel';

export default function DashboardPersonal() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ¡Hola, {user?.user_metadata?.first_name || 'Usuario'}!
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: es })}
          </p>
        </div>
        <Badge color="green">
          Dashboard Personal
        </Badge>
      </div>

      {/* KPI Cards */}
      <PersonalKpiCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <PersonalTasksPanel />
        <PersonalCalendarPanel />
        <PersonalPipelinePanel />
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <PersonalActivityPanel />
        <PersonalQuickActionsPanel />
      </div>
    </div>
  );
}