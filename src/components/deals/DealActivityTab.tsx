import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Deal } from '@/types/Deal';
import { Activity, Clock, Mail, Phone, Calendar, Plus, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DealActivityTabProps {
  deal: Deal;
}

export const DealActivityTab = ({ deal }: DealActivityTabProps) => {
  // Mock activity data - in a real app, this would come from an API
  const mockActivities = [
    {
      id: '1',
      type: 'stage_change',
      title: 'Etapa actualizada',
      description: `Oportunidad movida a ${deal.stage}`,
      date: new Date(deal.updatedAt),
      icon: Activity,
      color: 'hsl(213, 94%, 68%)'
    },
    {
      id: '2',
      type: 'deal_created',
      title: 'Oportunidad creada',
      description: `Oportunidad "${deal.title}" fue creada`,
      date: new Date(deal.createdAt),
      icon: Activity,
      color: 'hsl(158, 100%, 38%)'
    }
  ];

  // Add company activities if company exists
  if (deal.company) {
    mockActivities.push({
      id: '3',
      type: 'company_linked',
      title: 'Empresa vinculada',
      description: `Vinculada a ${deal.company.name}`,
      date: new Date(deal.createdAt),
      icon: User,
      color: 'hsl(42, 100%, 50%)'
    });
  }

  // Sort activities by date (most recent first)
  const sortedActivities = mockActivities.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cronología de Actividad</h3>
          <p className="text-sm text-muted-foreground">
            Rastrea todas las interacciones y cambios de esta oportunidad
          </p>
        </div>
        <Button size="sm" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Registrar Actividad
        </Button>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-4">
        {sortedActivities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === sortedActivities.length - 1;
          
          return (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div 
                  className="absolute left-6 top-12 w-0.5 h-12 bg-border"
                  style={{ height: '60px' }}
                />
              )}
              
              {/* Activity item */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div 
                  className="flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background"
                  style={{ borderColor: activity.color }}
                >
                  <Icon 
                    className="h-5 w-5" 
                    style={{ color: activity.color }}
                  />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(activity.date, 'dd MMM yyyy, HH:mm', { locale: es })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{sortedActivities.length}</p>
              <p className="text-sm text-muted-foreground">Total de Actividades</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Emails Enviados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Llamadas Realizadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground">Reuniones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximas Acciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Email de seguimiento</h4>
                  <p className="text-xs text-muted-foreground">
                    Enviar email de seguimiento a involucrados
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                Pendiente
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Programar llamada</h4>
                  <p className="text-xs text-muted-foreground">
                    Programar llamada de descubrimiento con decisor
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                Pendiente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty state for activities */}
      {sortedActivities.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aún no hay actividades</h3>
            <p className="text-muted-foreground mb-4">
              Comienza a interactuar con esta oportunidad para ver actividad aquí
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primera Actividad
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};