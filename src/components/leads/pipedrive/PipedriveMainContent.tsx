
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Clock,
  User,
  Building2,
  Euro,
  CheckCircle2,
  Circle,
  AlertCircle,
  Star,
  Send,
  PaperclipIcon
} from 'lucide-react';
import { Lead, LeadServiceType } from '@/types/Lead';
import { useLeadActivities } from '@/hooks/leads/useLeadActivities';
import { useLeadNotes } from '@/hooks/leads/useLeadNotes';
import { useLeadTasks } from '@/hooks/leads/useLeadTasks';
import { useLeads } from '@/hooks/useLeads';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateProposalDialog } from '@/components/proposals/CreateProposalDialog';
import { CreateMandateDialog } from '@/components/mandates/CreateMandateDialog';
import { EditableDealValue } from './EditableDealValue';
import { HistorySection } from './HistorySection';
import { ScheduleMeetingDialog } from './ScheduleMeetingDialog';
import { LeadTaskEngineList } from '@/components/leads/LeadTaskEngineList';
import { useFollowLead } from '@/hooks/leads/useFollowLead';
import { useLeadEngineAutomations } from '@/hooks/leads/useLeadEngineAutomations';

interface PipedriveMainContentProps {
  lead: Lead;
}

export const PipedriveMainContent = ({ lead }: PipedriveMainContentProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [newTask, setNewTask] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [isMandateDialogOpen, setIsMandateDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  
  const { activities, createActivity, isCreating: isCreatingActivity } = useLeadActivities(lead.id);
  const { notes, createNote, isCreating: isCreatingNote } = useLeadNotes(lead.id);
  const { tasks, createTask, updateTask, isCreating: isCreatingTask, refetch: refetchTasks } = useLeadTasks(lead.id);
  const { updateLead } = useLeads();
  const { toggleFollow, isUpdating: isUpdatingFollow } = useFollowLead();
  
  // Engine automations (creación, QUALIFIED, encadenadas, re-enganche)
  useLeadEngineAutomations(lead);


  useEffect(() => {
    console.info('[LeadTasks][debug]', { leadId: lead.id, tasksCount: tasks?.length });
  }, [lead.id, tasks]);

  useEffect(() => {
    console.info('[LeadTabs][debug] activeTab', activeTab);
    if (activeTab === 'tasks') {
      refetchTasks();
    }
  }, [activeTab, refetchTasks]);

  useEffect(() => {
    // Forzar refetch al cambiar de lead
    refetchTasks();
  }, [lead.id, refetchTasks]);

  const handleGenerateProposal = () => {
    setIsProposalDialogOpen(true);
  };

  const handleCreateMandate = () => {
    setIsMandateDialogOpen(true);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await createNote({
        lead_id: lead.id,
        note: newNote,
        note_type: 'general'
      });
      setNewNote('');
      setIsAddingNote(false);
      toast.success('Nota añadida exitosamente');
    } catch (error) {
      toast.error('Error al añadir la nota');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    
    try {
      await createTask({
        lead_id: lead.id,
        title: newTask,
        priority: 'medium'
      });
      setNewTask('');
      setIsAddingTask(false);
      toast.success('Tarea creada exitosamente');
    } catch (error) {
      toast.error('Error al crear la tarea');
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    try {
      await updateTask({
        id: taskId,
        updates: { 
          status: completed ? 'completed' : 'pending',
          completed_at: completed ? new Date().toISOString() : null
        }
      });
      toast.success(completed ? 'Tarea completada' : 'Tarea marcada como pendiente');
    } catch (error) {
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'email':
        window.open(`mailto:${lead.email}`, '_blank');
        break;
      case 'call':
        window.open(`tel:${lead.phone}`, '_blank');
        break;
      case 'meeting':
        setIsMeetingDialogOpen(true);
        break;
      default:
        break;
    }
  };

  const handleServiceTypeChange = async (serviceType: LeadServiceType) => {
    try {
      updateLead({
        id: lead.id,
        updates: { service_type: serviceType }
      });
    } catch (error) {
      toast.error('Error al actualizar el tipo de servicio');
    }
  };

  const getServiceTypeLabel = (serviceType?: LeadServiceType) => {
    switch (serviceType) {
      case 'mandato_venta':
        return 'Mandato de Venta';
      case 'mandato_compra':
        return 'Mandato de Compra';
      case 'valoracion_empresa':
        return 'Valoración de Empresa';
      default:
        return 'Mandato de Venta';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Circle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-green-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'note':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-background">
      {/* Deal Header with Key Info */}
      <div className="border-b border-border bg-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-2 animate-fade-in">
              {lead.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {lead.company_name && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{lead.company_name}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{lead.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <EditableDealValue 
              value={lead.deal_value || 0} 
              leadId={lead.id}
              onUpdate={(newValue) => {
                updateLead({
                  id: lead.id,
                  updates: { deal_value: newValue }
                });
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleQuickAction('email')}
            variant="outline"
            size="sm"
            className="hover-lift transition-all duration-200"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button
            onClick={() => handleQuickAction('call')}
            variant="outline"
            size="sm"
            className="hover-lift transition-all duration-200"
          >
            <Phone className="h-4 w-4 mr-2" />
            Llamar
          </Button>
          <Button
            onClick={() => handleQuickAction('meeting')}
            variant="outline"
            size="sm"
            className="hover-lift transition-all duration-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reunión
          </Button>
          <Button
            onClick={() => toggleFollow({ 
              leadId: lead.id, 
              isFollowed: !lead.is_followed 
            })}
            variant={lead.is_followed ? "default" : "outline"}
            size="sm"
            className="hover-lift transition-all duration-200"
            disabled={isUpdatingFollow}
          >
            <Star className={`h-4 w-4 mr-2 ${lead.is_followed ? 'fill-current' : ''}`} />
            {lead.is_followed ? 'Siguiendo' : 'Seguir'}
          </Button>
        </div>
      </div>

      {/* Service Type Section */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">Tipo de Servicio:</span>
            </div>
            <Select
              value={lead.service_type || 'mandato_venta'}
              onValueChange={handleServiceTypeChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mandato_venta">Mandato de Venta</SelectItem>
                <SelectItem value="mandato_compra">Mandato de Compra</SelectItem>
                <SelectItem value="valoracion_empresa">Valoración de Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerateProposal}>
              <FileText className="h-4 w-4 mr-2" />
              Generar Propuesta
            </Button>
            <Button variant="outline" size="sm" onClick={handleCreateMandate}>
              <PaperclipIcon className="h-4 w-4 mr-2" />
              Crear Mandato
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="flex-1 min-h-0">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 min-h-0 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-5 mx-6 mt-4">
            <TabsTrigger value="overview" className="transition-all duration-200">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="activities" className="transition-all duration-200">
              Actividades
            </TabsTrigger>
            <TabsTrigger value="notes" className="transition-all duration-200">
              Notas ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="transition-all duration-200">
              Tareas ({tasks.filter(t => t.status !== 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="history" className="transition-all duration-200">
              Historia
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0 p-6 flex flex-col">
            <TabsContent value="overview" className="h-full overflow-y-auto animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lead Score & Status */}
                <Card className="hover-lift transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      Puntuación del Lead
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {lead.lead_score || 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{lead.status}</Badge>
                      <Badge variant="outline">{lead.priority || 'MEDIUM'}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Lead Source */}
                <Card className="hover-lift transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Origen del Lead</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold mb-2 capitalize">
                      {lead.source?.replace('_', ' ') || 'No especificado'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Creado el {format(new Date(lead.created_at), 'dd MMM yyyy', { locale: es })}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity Summary */}
                <Card className="lg:col-span-2 hover-lift transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.length > 0 ? (
                      <div className="space-y-3">
                        {activities.slice(0, 3).map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            {getActivityIcon(activity.activity_type)}
                            <div className="flex-1">
                              <div className="font-medium">{activity.activity_type.replace('_', ' ')}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(activity.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay actividades registradas</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="activities" className="h-full overflow-hidden animate-fade-in">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Actividades</CardTitle>
                    <Button size="sm" className="hover-lift transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Actividad
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full flex-1 min-h-0">
                    {activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.map((activity) => (
                          <div 
                            key={activity.id} 
                            className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors duration-200"
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                              {getActivityIcon(activity.activity_type)}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold mb-1">{activity.activity_type.replace('_', ' ')}</div>
                              {activity.activity_data && (
                                <div className="text-sm text-muted-foreground mb-2">
                                  {JSON.stringify(activity.activity_data)}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>
                                  {format(new Date(activity.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                                </span>
                                <span>Puntos: {activity.points_awarded}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No hay actividades</p>
                        <p className="text-sm">Las actividades aparecerán aquí cuando se registren</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="h-full overflow-hidden animate-fade-in">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Notas</CardTitle>
                    <Button 
                      size="sm" 
                      onClick={() => setIsAddingNote(true)}
                      className="hover-lift transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Nota
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 overflow-hidden space-y-4">
                  {/* Add Note Form */}
                  {isAddingNote && (
                    <div className="p-4 border rounded-lg bg-muted/50 animate-scale-in">
                      <Textarea
                        placeholder="Escribe tu nota aquí..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="mb-3 min-h-[100px] resize-none"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleAddNote}
                          disabled={isCreatingNote || !newNote.trim()}
                          className="hover-lift transition-all duration-200"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isCreatingNote ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingNote(false);
                            setNewNote('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-full flex-1 min-h-0">
                    {notes.length > 0 ? (
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div 
                            key={note.id} 
                            className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                <FileText className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm whitespace-pre-wrap mb-2">
                                  {note.note}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(note.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No hay notas</p>
                        <p className="text-sm">Añade notas para hacer seguimiento de información importante</p>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="h-full min-h-0 animate-fade-in">
              <Card className="h-full min-h-0 flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tareas</CardTitle>
                    <Button 
                      size="sm" 
                      onClick={() => setIsAddingTask(true)}
                      className="hover-lift transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 space-y-4">
                  {/* Add Task Form */}
                  {isAddingTask && (
                    <div className="p-4 border rounded-lg bg-muted/50 animate-scale-in">
                      <Input
                        placeholder="Título de la tarea..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="mb-3"
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleAddTask}
                          disabled={isCreatingTask || !newTask.trim()}
                          className="hover-lift transition-all duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {isCreatingTask ? 'Creando...' : 'Crear'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingTask(false);
                            setNewTask('');
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="h-full flex-1 min-h-0 overflow-y-auto pr-1">
                    {tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div 
                            key={task.id} 
                            className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors duration-200"
                          >
                            <button
                              onClick={() => handleTaskComplete(task.id, task.status !== 'completed')}
                              className="mt-1 hover:scale-110 transition-transform duration-200"
                            >
                              {task.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400 hover:text-primary" />
                              )}
                            </button>
                            <div className="flex-1">
                              <div className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </div>
                              {task.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {task.description}
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                {getPriorityIcon(task.priority)}
                                {task.due_date && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {format(new Date(task.created_at), 'dd MMM yyyy', { locale: es })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No hay tareas</p>
                        <p className="text-sm">Crea tareas para organizar tu trabajo con este lead</p>
                      </div>
                    )}

                    {/* Engine suggested tasks */}
                    <div className="mt-6">
                      <Separator className="my-4" />
                      <h4 className="text-sm font-semibold mb-2">Tareas sugeridas</h4>
                      <LeadTaskEngineList leadId={lead.id} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="h-full overflow-y-auto animate-fade-in">
              <HistorySection lead={lead} />
            </TabsContent>

          </div>
        </Tabs>
      </div>

      {/* Modales */}
      <CreateProposalDialog 
        isOpen={isProposalDialogOpen} 
        onClose={() => setIsProposalDialogOpen(false)}
        leadId={lead.id}
      />
      
      <CreateMandateDialog 
        open={isMandateDialogOpen}
        onOpenChange={setIsMandateDialogOpen}
        onSuccess={() => setIsMandateDialogOpen(false)}
        initialData={{
          mandate_name: `Mandato para ${lead.name}`,
          client_name: lead.name || '',
          client_contact: lead.name || '',
          client_email: lead.email || '',
          client_phone: lead.phone || '',
          target_sectors: lead.sector_id ? [lead.sector_id] : [],
          target_locations: ['España']
        }}
        leadId={lead.id}
      />
      
      <ScheduleMeetingDialog
        open={isMeetingDialogOpen}
        onOpenChange={setIsMeetingDialogOpen}
        leadId={lead.id}
      />
    </div>
  );
};
