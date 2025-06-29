
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      return <Badge className="bg-white text-gray-800 border-gray-200">Media</Badge>;
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
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center">
          <Activity className="mr-2 h-6 w-6 text-blue-600" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No hay actividad reciente</p>
              <p className="text-gray-400 text-sm mt-1">Las actividades aparecerán aquí cuando ocurran</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const ActivityIcon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div key={activity.id} className="group">
                  <div className="flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-slate-100 hover:border-slate-200">
                    {/* Timeline indicator */}
                    <div className="relative">
                      <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center shadow-md`}>
                        <ActivityIcon className="h-5 w-5 text-white" />
                      </div>
                      {index < activities.length - 1 && (
                        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-slate-200"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">
                              {activity.user?.substring(0, 2).toUpperCase() || 'SI'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-slate-600">
                            {activity.user || 'Sistema'}
                          </span>
                        </div>
                        {getPriorityBadge(activity.priority)}
                      </div>
                      
                      <p className="text-slate-800 font-medium mb-2 leading-relaxed">
                        {activity.description}
                      </p>
                      
                      <p className="text-xs text-slate-500 flex items-center">
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
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors">
              Ver toda la actividad →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
