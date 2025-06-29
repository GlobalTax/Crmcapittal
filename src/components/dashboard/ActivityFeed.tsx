
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
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay actividad reciente
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10">
                    {activity.user?.substring(0, 2).toUpperCase() || 'SY'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
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
