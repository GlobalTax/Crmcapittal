import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Activity, Clock } from 'lucide-react';

export const PersonalActivityPanel = () => {
  const { activities, loading } = useActivityFeed();

  return (
    <DashboardCard title="Actividad Reciente" icon={Activity}>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No hay actividad reciente"
            subtitle="Las actividades aparecerán aquí"
          />
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Hace 2 horas
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardCard>
  );
};