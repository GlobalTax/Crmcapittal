
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Activity, StickyNote, Calendar, FileText, Users } from 'lucide-react';
import { Lead } from '@/types/Lead';

interface PipedriveMainContentProps {
  lead: Lead;
}

export const PipedriveMainContent = ({ lead }: PipedriveMainContentProps) => {
  const [activeTab, setActiveTab] = useState('activity');

  const tabs = [
    { id: 'activity', label: 'Actividad', icon: Activity, count: 2 },
    { id: 'notes', label: 'Notas', icon: StickyNote, count: 0 },
    { id: 'scheduler', label: 'Planificador de reuniones', icon: Calendar, count: 0 },
    { id: 'files', label: 'Archivos', icon: FileText, count: 0 },
    { id: 'participants', label: 'Participantes', icon: Users, count: 1 }
  ];

  const activities = [
    {
      id: '1',
      type: 'created',
      title: 'Deal creado',
      description: 'El deal fue creado en el sistema',
      date: lead.created_at,
      user: 'Sistema'
    },
    {
      id: '2',
      type: 'stage_change',
      title: 'Etapa actualizada',
      description: 'Deal movido a Pipeline',
      date: lead.updated_at,
      user: 'Usuario'
    }
  ];

  return (
    <div className="flex-1">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        {/* Tabs Header */}
        <div className="border-b border-border px-6 py-4">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <IconComponent className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tabs Content */}
        <div className="p-6 overflow-y-auto">
          <TabsContent value="activity" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Línea de tiempo de actividad</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir actividad
                </Button>
              </div>
              
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <Card key={activity.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {activity.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleString('es-ES')} • {activity.user}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notas</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir nota
                </Button>
              </div>
              
              <div className="text-center py-12 text-muted-foreground">
                <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay notas aún</p>
                <p className="text-sm">Añade tu primera nota para hacer seguimiento</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduler" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Planificador de reuniones</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Programar reunión
                </Button>
              </div>
              
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay reuniones programadas</p>
                <p className="text-sm">Programa tu primera reunión</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Archivos</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Subir archivo
                </Button>
              </div>
              
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay archivos</p>
                <p className="text-sm">Sube archivos para compartir con tu equipo</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Participantes</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir participante
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {lead.name?.charAt(0) || lead.email.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">{lead.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
