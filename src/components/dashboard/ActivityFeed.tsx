
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, Bell, Users, Building2 } from "lucide-react";

interface Activity {
  id: string;
  type: 'operation' | 'lead' | 'user';
  description: string;
  timestamp: Date;
  user?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'operation':
        return Building2;
      case 'lead':
        return Bell;
      case 'user':
        return Users;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'operation':
        return 'bg-blue-100 text-blue-600';
      case 'lead':
        return 'bg-green-100 text-green-600';
      case 'user':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Actividad Reciente
          </CardTitle>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver todo
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Activity className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center">
                No hay actividad reciente
              </p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <ActivityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-relaxed">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(activity.timestamp, { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </p>
                        {activity.user && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <p className="text-xs text-gray-500">
                              por {activity.user}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
