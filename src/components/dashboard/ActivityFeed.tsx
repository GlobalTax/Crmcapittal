
import { DashboardCard } from "./DashboardCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, TrendingUp, Users, AlertCircle } from "lucide-react";

interface Activity {
  id: string;
  type: 'operation' | 'lead' | 'user';
  description: string;
  timestamp: Date;
  user?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface ActivityFeedProps {
  activities: Activity[];
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'operation':
      return TrendingUp;
    case 'lead':
      return Users;
    case 'user':
      return Activity;
    default:
      return AlertCircle;
  }
};

const getPriorityBadge = (priority?: string) => {
  switch (priority) {
    case 'high':
      return <Badge className="bg-red-100 text-red-800 border-red-200">Alta</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Media</Badge>;
    case 'low':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Baja</Badge>;
    default:
      return null;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'operation':
      return 'bg-blue-500';
    case 'lead':
      return 'bg-green-500';
    case 'user':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <DashboardCard title="Actividad Reciente" icon={Activity}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No hay actividad reciente"
              subtitle="Las actividades aparecerán aquí cuando ocurran"
            />
          ) : (
            activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="group">
                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-accent/50 transition-all duration-200 border border-border hover:border-primary/20">
                    {/* Timeline indicator */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-md">
                        <ActivityIcon className="h-5 w-5 text-primary-foreground" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-border"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {activity.user?.substring(0, 2).toUpperCase() || 'SI'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-muted-foreground">
                            {activity.user || 'Sistema'}
                          </span>
                        </div>
                        {getPriorityBadge(activity.priority)}
                      </div>
                      
                      <p className="text-foreground font-medium mb-2 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      <p className="text-xs text-muted-foreground flex items-center">
                        <span className="mr-1">🕒</span>
                        {formatDistanceToNow(activity.timestamp, { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <button className="w-full text-center text-sm text-primary hover:text-primary/80 font-medium py-2 px-4 rounded-lg hover:bg-accent transition-colors">
              Ver toda la actividad →
            </button>
          </div>
        )}
    </DashboardCard>
  );
};
