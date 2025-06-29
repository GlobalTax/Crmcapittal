
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

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
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-900">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-50 text-blue-600 text-xs">
                    {activity.user?.substring(0, 2).toUpperCase() || 'SI'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(activity.timestamp, { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
