
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  MessageSquare,
  Target,
  Clock,
  Building,
  Phone
} from 'lucide-react';
import { useAdvancedContacts } from '@/hooks/useAdvancedContacts';
import { CONTACT_TYPES, CONTACT_PRIORITIES } from '@/types/Contact';

export const ContactsDashboard = () => {
  const { analytics, loading, reminders, interactions } = useAdvancedContacts();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const upcomingReminders = reminders.filter(r => 
    new Date(r.reminder_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).slice(0, 5);

  const recentInteractions = interactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contactos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalContacts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeContacts || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interacciones (30d)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.recentInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Comunicaciones recientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recordatorios</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingReminders.length}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              Lead to deal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONTACT_TYPES.map(type => {
              const count = analytics.contactsByType?.[type.value] || 0;
              const percentage = analytics.totalContacts > 0 
                ? (count / analytics.totalContacts) * 100 
                : 0;
              
              return (
                <div key={type.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type.label}</span>
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Distribución por prioridad */}
        <Card>
          <CardHeader>
            <CardTitle>Contactos por Prioridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONTACT_PRIORITIES.map(priority => {
              const count = analytics.contactsByPriority?.[priority.value] || 0;
              const percentage = analytics.totalContacts > 0 
                ? (count / analytics.totalContacts) * 100 
                : 0;
              
              return (
                <div key={priority.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{priority.label}</span>
                    <Badge className={priority.color}>{count}</Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recordatorios próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recordatorios Próximos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{reminder.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(reminder.reminder_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {reminder.reminder_type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay recordatorios próximos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Interacciones recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Actividad Reciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentInteractions.length > 0 ? (
              <div className="space-y-3">
                {recentInteractions.map(interaction => (
                  <div key={interaction.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {interaction.interaction_type === 'email' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                      {interaction.interaction_type === 'call' && <Phone className="h-4 w-4 text-blue-600" />}
                      {interaction.interaction_type === 'meeting' && <Calendar className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{interaction.subject || interaction.interaction_type}</p>
                      <p className="text-xs text-gray-600">
                        {interaction.interaction_date && new Date(interaction.interaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {interaction.interaction_type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No hay interacciones recientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tipos de interacción más frecuentes */}
      <Card>
        <CardHeader>
          <CardTitle>Canales de Comunicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(analytics.interactionsByType || {}).map(([type, count]) => (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{count as number}</div>
                <div className="text-sm text-gray-600 capitalize">{type}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
