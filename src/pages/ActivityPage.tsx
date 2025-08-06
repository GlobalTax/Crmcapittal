import { useState } from 'react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/minimal/Button';
import { Badge } from '@/components/ui/minimal/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Clock, User, Briefcase, Mail, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'contact':
      return <User className="h-4 w-4" />;
    case 'email':
      return <Mail className="h-4 w-4" />;
    case 'meeting':
      return <Clock className="h-4 w-4" />;
    case 'deal':
      return <Briefcase className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'contact':
      return 'blue';
    case 'email':
      return 'green';
    case 'meeting':
      return 'yellow';
    case 'deal':
      return 'red';
    default:
      return 'gray';
  }
};

export default function ActivityPage() {
  const { activities, loading, error } = useActivityFeed();
  const [filter, setFilter] = useState<string>('all');

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Todas las Actividades</h1>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Todas las Actividades</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Error al cargar las actividades: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Todas las Actividades</h1>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="contact">Contactos</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Reuniones</SelectItem>
                <SelectItem value="deal">Operaciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Timeline de Actividades ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {filter === 'all' ? 'No hay actividades' : `No hay actividades de tipo ${filter}`}
              </h3>
              <p className="text-muted-foreground">
                Las actividades aparecerán aquí cuando comiences a interactuar con el sistema.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <div key={activity.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full bg-${getActivityColor(activity.type)}-100 text-${getActivityColor(activity.type)}-600`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge color={getActivityColor(activity.type)}>
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}