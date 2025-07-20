import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Activity, StickyNote, Calendar, FileText, Users, Loader2 } from 'lucide-react';
import { Lead } from '@/types/Lead';
import { useLeadActivities } from '@/hooks/leads/useLeadActivities';
import { useLeadNotes } from '@/hooks/leads/useLeadNotes';
import { useLeadTasks } from '@/hooks/leads/useLeadTasks';
import { toast } from 'sonner';

interface PipedriveMainContentProps {
  lead: Lead;
}

export const PipedriveMainContent = ({ lead }: PipedriveMainContentProps) => {
  const [activeTab, setActiveTab] = useState('activity');
  const [newNote, setNewNote] = useState('');
  const [newActivity, setNewActivity] = useState({
    title: '',
    description: '',
    activity_type: 'call',
  });

  // Real data hooks
  const { activities, createActivity, isLoading: activitiesLoading } = useLeadActivities(lead.id);
  const { notes, createNote, isLoading: notesLoading } = useLeadNotes(lead.id);
  const { tasks, createTask, isLoading: tasksLoading } = useLeadTasks(lead.id);

  const tabs = [
    { id: 'activity', label: 'Actividad', icon: Activity, count: activities.length },
    { id: 'notes', label: 'Notas', icon: StickyNote, count: notes.length },
    { id: 'scheduler', label: 'Tareas', icon: Calendar, count: tasks.length },
    { id: 'files', label: 'Archivos', icon: FileText, count: 0 },
    { id: 'participants', label: 'Participantes', icon: Users, count: 1 }
  ];

  const handleCreateNote = () => {
    if (!newNote.trim()) return;
    
    createNote({
      lead_id: lead.id,
      note: newNote,
      note_type: 'general',
    });
    setNewNote('');
  };

  const handleCreateActivity = () => {
    if (!newActivity.title.trim()) return;
    
    createActivity({
      lead_id: lead.id,
      ...newActivity,
    });
    setNewActivity({ title: '', description: '', activity_type: 'call' });
  };

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
                <Button 
                  size="sm" 
                  onClick={() => {
                    setNewActivity({ title: 'Nueva actividad', description: '', activity_type: 'call' });
                    handleCreateActivity();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir actividad
                </Button>
              </div>

              {/* Quick Activity Form */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="Título de la actividad"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <Textarea
                      placeholder="Descripción (opcional)"
                      value={newActivity.description}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                    <Button onClick={handleCreateActivity} disabled={!newActivity.title.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear actividad
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {activitiesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          <div className="flex-1">
                            <div className="font-medium">{activity.title}</div>
                            {activity.description && (
                              <div className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.activity_date).toLocaleString('es-ES')} • {activity.activity_type}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {activities.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay actividades aún</p>
                      <p className="text-sm">Añade tu primera actividad para hacer seguimiento</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notas</h3>
                <Button size="sm" onClick={handleCreateNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir nota
                </Button>
              </div>

              {/* Quick Note Form */}
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Escribe una nueva nota..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                </CardContent>
              </Card>
              
              {notesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="whitespace-pre-wrap">{note.note}</div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(note.created_at).toLocaleString('es-ES')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {notes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay notas aún</p>
                      <p className="text-sm">Añade tu primera nota para hacer seguimiento</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="scheduler" className="mt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tareas</h3>
                <Button 
                  size="sm" 
                  onClick={() => {
                    createTask({
                      lead_id: lead.id,
                      title: 'Nueva tarea',
                      description: 'Tarea creada desde el pipeline',
                      priority: 'medium',
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear tarea
                </Button>
              </div>
              
              {tasksLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            {task.description && (
                              <div className="text-sm text-muted-foreground">{task.description}</div>
                            )}
                            <div className="text-xs text-muted-foreground mt-1">
                              Estado: {task.status} • Prioridad: {task.priority}
                              {task.due_date && ` • Vence: ${new Date(task.due_date).toLocaleDateString('es-ES')}`}
                            </div>
                          </div>
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay tareas programadas</p>
                      <p className="text-sm">Crea tu primera tarea</p>
                    </div>
                  )}
                </div>
              )}
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
                      {lead.company_name && (
                        <div className="text-sm text-muted-foreground">{lead.company_name}</div>
                      )}
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