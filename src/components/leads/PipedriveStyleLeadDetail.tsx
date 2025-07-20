import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  Star,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Settings,
  PlusCircle,
  ActivityIcon,
  FileText,
  CheckSquare,
  Upload
} from 'lucide-react';
import { useLead } from '@/hooks/useLeads';
import { useLeadActivities } from '@/hooks/useLeadActivitiesSimple';
import { useLeadNotes } from '@/hooks/useLeadNotesSimple';
import { useLeadTasks } from '@/hooks/useLeadTasksSimple';
import { usePipelineStages } from '@/hooks/usePipelineStagesSimple';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const PipedriveStyleLeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('timeline');
  
  const { lead, isLoading: leadLoading } = useLead(id || '');
  const { activities, isLoading: activitiesLoading } = useLeadActivities(id || '');
  const { notes, isLoading: notesLoading } = useLeadNotes(id || '');
  const { tasks, isLoading: tasksLoading } = useLeadTasks(id || '');
  const { stages } = usePipelineStages();

  const isLoading = leadLoading || activitiesLoading || notesLoading || tasksLoading;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Lead not found</p>
      </div>
    );
  }

  const currentStage = stages.find(s => s.id === lead.pipeline_stage_id);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header - Pipedrive Style */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">{lead.name}</h1>
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Navigation between leads */}
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Lead Details */}
        <div className="w-80 border-r border-border bg-neutral-50 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {/* Deal Value and Stage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valor del Deal</span>
                  <span className="text-lg font-semibold">
                    {lead.deal_value ? `€${lead.deal_value.toLocaleString()}` : '€0'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pipeline</span>
                    <Badge variant={currentStage ? "default" : "secondary"}>
                      {currentStage?.name || 'Sin etapa'}
                    </Badge>
                  </div>
                  
                  {lead.probability && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Probabilidad</span>
                        <span>{lead.probability}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${lead.probability}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {lead.estimated_close_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fecha de cierre</span>
                    <span className="text-sm">
                      {format(new Date(lead.estimated_close_date), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  INFORMACIÓN DE CONTACTO
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company_name}</p>
                    </div>
                  </div>
                  
                  {lead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.email}</span>
                    </div>
                  )}
                  
                  {lead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.phone}</span>
                    </div>
                  )}
                  
                  {lead.company_name && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{lead.company_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Lead Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  DETALLES DEL LEAD
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estado</span>
                    <Badge variant={lead.status === 'NEW' ? 'default' : 'secondary'}>
                      {lead.status}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Fuente</span>
                    <span className="text-sm">{lead.source || 'No especificada'}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Creado</span>
                    <span className="text-sm">
                      {format(new Date(lead.created_at), 'dd MMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Center Content - Activities Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="border-b border-border bg-background">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between px-4 py-2">
                <TabsList className="h-auto p-0 bg-transparent">
                  <TabsTrigger 
                    value="timeline"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger 
                    value="activities"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    Actividades
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notes"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    Notas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tasks"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                  >
                    Tareas
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Añadir Actividad
                  </Button>
                </div>
              </div>

              {/* Tab Content */}
              <TabsContent value="timeline" className="mt-0">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4 space-y-4">
                    {/* Combined timeline of all activities */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Timeline de Actividades</h3>
                      
                      {[...activities, ...notes.map(n => ({...n, activity_type: 'note' as const})), ...tasks.map(t => ({...t, activity_type: 'task' as const}))]
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((item, index) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              {item.activity_type === 'note' ? (
                                <FileText className="h-4 w-4 text-primary" />
                              ) : item.activity_type === 'task' ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <ActivityIcon className="h-4 w-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {'title' in item ? item.title : 'note' in item ? 'Nota añadida' : 'Actividad'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(item.created_at), 'dd MMM, HH:mm', { locale: es })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {'description' in item ? item.description : 'note' in item ? item.note : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="activities" className="mt-0">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Actividades</h3>
                      <Button size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nueva Actividad
                      </Button>
                    </div>
                    
                    {activities.map((activity) => (
                      <div key={activity.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <ActivityIcon className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{format(new Date(activity.activity_date), 'dd MMM yyyy, HH:mm', { locale: es })}</span>
                              {activity.duration_minutes && (
                                <span>{activity.duration_minutes} min</span>
                              )}
                              {activity.outcome && (
                                <Badge variant="outline" className="text-xs">
                                  {activity.outcome}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="notes" className="mt-0">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Notas</h3>
                      <Button size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nueva Nota
                      </Button>
                    </div>
                    
                    {notes.map((note) => (
                      <div key={note.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm">{note.note}</p>
                            <div className="text-xs text-muted-foreground mt-2">
                              {format(new Date(note.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tasks" className="mt-0">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Tareas</h3>
                      <Button size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nueva Tarea
                      </Button>
                    </div>
                    
                    {tasks.map((task) => (
                      <div key={task.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckSquare className={`h-5 w-5 mt-0.5 ${task.status === 'completed' ? 'text-green-600' : 'text-primary'}`} />
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {task.due_date && (
                                <span>Vence: {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}</span>
                              )}
                              <Badge variant="outline" className={`text-xs ${
                                task.priority === 'high' ? 'border-red-200 text-red-700' :
                                task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-gray-200 text-gray-700'
                              }`}>
                                {task.priority}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="w-64 border-l border-border bg-neutral-50 p-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              ACCIONES RÁPIDAS
            </h3>
            
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Reunión
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <CheckSquare className="h-4 w-4 mr-2" />
                Crear Tarea
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Próximas Acciones</h4>
              
              {tasks.filter(t => t.status !== 'completed').slice(0, 3).map((task) => (
                <div key={task.id} className="text-sm">
                  <p className="font-medium">{task.title}</p>
                  {task.due_date && (
                    <p className="text-muted-foreground text-xs">
                      {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};