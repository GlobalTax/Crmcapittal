
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  StickyNote, 
  CheckSquare, 
  Users, 
  User,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Phone,
  Mail
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useMandateNotes } from '@/hooks/useMandateNotes';
import { useMandateTasks } from '@/hooks/useMandateTasks';
import { useMandatePeople } from '@/hooks/useMandatePeople';
import { CreateNoteForm } from './forms/CreateNoteForm';
import { CreateTaskForm } from './forms/CreateTaskForm';
import { CreatePersonForm } from './forms/CreatePersonForm';
import { EmptyState } from '@/components/ui/EmptyState';

interface BuyingMandateDetailViewProps {
  mandate: BuyingMandate;
}

export const BuyingMandateDetailView = ({ mandate }: BuyingMandateDetailViewProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);

  const { notes, loading: notesLoading, deleteNote } = useMandateNotes(mandate.id);
  const { tasks, loading: tasksLoading, toggleTaskCompletion, deleteTask } = useMandateTasks(mandate.id);
  const { people, loading: peopleLoading, deletePerson } = useMandatePeople(mandate.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: BuyingMandate['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{mandate.mandate_name}</h1>
          <p className="text-muted-foreground">
            Cliente: {mandate.client_name} • Contacto: {mandate.client_contact}
          </p>
        </div>
        {getStatusBadge(mandate.status)}
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Mandato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">Sectores Objetivo</h4>
              <div className="flex flex-wrap gap-1">
                {mandate.target_sectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Criterios Financieros</h4>
              <div className="space-y-1 text-sm">
                <div>Facturación: {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}</div>
                <div>EBITDA: {formatCurrency(mandate.min_ebitda)} - {formatCurrency(mandate.max_ebitda)}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Timeline</h4>
              <div className="space-y-1 text-sm">
                <div>Inicio: {formatDate(mandate.start_date)}</div>
                {mandate.end_date && <div>Fin: {formatDate(mandate.end_date)}</div>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notas ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tareas ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personas ({people.length})
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Notas del Mandato</h3>
            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Nota
                </Button>
              </DialogTrigger>
              <CreateNoteForm
                mandateId={mandate.id}
                onSuccess={() => setNoteDialogOpen(false)}
              />
            </Dialog>
          </div>

          {notesLoading ? (
            <div>Cargando notas...</div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={StickyNote}
              title="No hay notas aún"
              subtitle="Añade la primera nota para hacer seguimiento de información importante sobre este mandato"
              action={{
                label: "Crear Primera Nota",
                onClick: () => setNoteDialogOpen(true)
              }}
            />
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {note.note_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(note.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Tareas del Mandato</h3>
            <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Tarea
                </Button>
              </DialogTrigger>
              <CreateTaskForm
                mandateId={mandate.id}
                onSuccess={() => setTaskDialogOpen(false)}
              />
            </Dialog>
          </div>

          {tasksLoading ? (
            <div>Cargando tareas...</div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No hay tareas asignadas"
              subtitle="Crea tareas para organizar el trabajo relacionado con este mandato"
              action={{
                label: "Crear Primera Tarea",
                onClick: () => setTaskDialogOpen(true)
              }}
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <Card key={task.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="h-4 w-4"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1 mt-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Vence: {formatDate(task.due_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Personas Involucradas</h3>
            <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Persona
                </Button>
              </DialogTrigger>
              <CreatePersonForm
                mandateId={mandate.id}
                onSuccess={() => setPersonDialogOpen(false)}
              />
            </Dialog>
          </div>

          {peopleLoading ? (
            <div>Cargando personas...</div>
          ) : people.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No hay personas registradas"
              subtitle="Añade las personas clave involucradas en este mandato para mejor seguimiento"
              action={{
                label: "Añadir Primera Persona",
                onClick: () => setPersonDialogOpen(true)
              }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {people.map((person) => (
                <Card key={person.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{person.name}</h4>
                            {person.is_primary && (
                              <Badge variant="default" className="text-xs">
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">
                            {person.role}
                          </p>
                          {person.company && (
                            <p className="text-sm text-muted-foreground">
                              {person.company}
                            </p>
                          )}
                          <div className="flex flex-col gap-1 mt-2">
                            {person.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a 
                                  href={`mailto:${person.email}`}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {person.email}
                                </a>
                              </div>
                            )}
                            {person.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a 
                                  href={`tel:${person.phone}`}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {person.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePerson(person.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
