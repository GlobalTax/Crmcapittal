
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckSquare, 
  Plus,
  Target,
  Eye
} from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMandateNotes } from '@/hooks/useMandateNotes';
import { useMandateTasks } from '@/hooks/useMandateTasks';
import { useMandatePeople } from '@/hooks/useMandatePeople';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useMandatoById } from '@/hooks/useMandatoById';
import { CreateNoteForm } from './forms/CreateNoteForm';
import { CreateTaskForm } from './forms/CreateTaskForm';
import { CreatePersonForm } from './forms/CreatePersonForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { MandatoTargetPanel } from './MandatoTargetPanel';

export const BuyingMandateDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const { mandato: mandate, isLoading } = useMandatoById(id);
  const { targets, documents, fetchTargets, fetchDocuments } = useBuyingMandates();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);

  // Hooks para datos del mandato
  const { notes, createNote, updateNote, deleteNote } = useMandateNotes(id || '');
  const { tasks, createTask, updateTask, deleteTask } = useMandateTasks(id || '');
  const { people, createPerson, updatePerson, deletePerson } = useMandatePeople(id || '');

  // Filtrar targets y documentos para este mandato
  const mandateTargets = targets.filter(t => t.mandate_id === id);
  const mandateDocuments = documents.filter(d => d.mandate_id === id);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!mandate) {
    return <div>Mandato no encontrado</div>;
  }

  // Estadísticas de targets
  const contactedTargets = mandateTargets.filter(t => t.contacted).length;
  const interestedTargets = mandateTargets.filter(t => 
    ['interested', 'nda_signed'].includes(t.status)
  ).length;

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditTarget = (target: any) => {
    // Función para editar target - se puede expandir más adelante
    console.log('Edit target:', target);
  };

  const handleViewDocuments = (target: any) => {
    // Función para ver documentos del target
    console.log('View documents for target:', target);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header del Mandato */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{mandate.mandate_name}</h1>
          <p className="text-muted-foreground mt-1">
            Cliente: {mandate.client_name} • Contacto: {mandate.client_contact}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusBadge(mandate.status)}>
              {mandate.status}
            </Badge>
            <Badge variant="outline">
              {mandate.mandate_type === 'compra' ? 'Mandato de Compra' : 'Mandato de Venta'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandateTargets.length}</div>
            <p className="text-xs text-muted-foreground">empresas objetivo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{contactedTargets}</div>
            <p className="text-xs text-muted-foreground">
              {mandateTargets.length > 0 ? Math.round((contactedTargets / mandateTargets.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{interestedTargets}</div>
            <p className="text-xs text-muted-foreground">interesados/NDA firmado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandateDocuments.length}</div>
            <p className="text-xs text-muted-foreground">archivos gestionados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="people">Personas</TabsTrigger>
        </TabsList>

        {/* Tab de Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información del Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Cliente:</span>
                  <p className="text-sm text-muted-foreground">{mandate.client_name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Contacto:</span>
                  <p className="text-sm text-muted-foreground">{mandate.client_contact}</p>
                </div>
                {mandate.client_email && (
                  <div>
                    <span className="text-sm font-medium">Email:</span>
                    <p className="text-sm text-muted-foreground">{mandate.client_email}</p>
                  </div>
                )}
                {mandate.client_phone && (
                  <div>
                    <span className="text-sm font-medium">Teléfono:</span>
                    <p className="text-sm text-muted-foreground">{mandate.client_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Criterios de Búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Criterios de Búsqueda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mandate.target_sectors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Sectores:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mandate.target_sectors.map((sector, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sector}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {mandate.target_locations.length > 0 && (
                  <div>
                    <span className="text-sm font-medium">Ubicaciones:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mandate.target_locations.map((location, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium">Facturación:</span>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(mandate.min_revenue)} - {formatCurrency(mandate.max_revenue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">EBITDA:</span>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(mandate.min_ebitda)} - {formatCurrency(mandate.max_ebitda)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab de Targets */}
        <TabsContent value="targets">
          <MandatoTargetPanel
            targets={mandateTargets}
            documents={mandateDocuments}
            onEditTarget={handleEditTarget}
            onViewDocuments={handleViewDocuments}
          />
        </TabsContent>

        {/* Tab de Notas */}
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas del Mandato
                </CardTitle>
                <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Nota
                    </Button>
                  </DialogTrigger>
                  <CreateNoteForm 
                    onSubmit={createNote}
                    onClose={() => setNoteDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No hay notas"
                  description="Añade la primera nota para este mandato"
                  action={
                    <Button onClick={() => setNoteDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Nota
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{note.title}</h4>
                        <Badge variant="outline">{note.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Tareas */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Tareas del Mandato
                </CardTitle>
                <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tarea
                    </Button>
                  </DialogTrigger>
                  <CreateTaskForm 
                    onSubmit={createTask}
                    onClose={() => setTaskDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <EmptyState
                  icon={CheckSquare}
                  title="No hay tareas"
                  description="Crea la primera tarea para este mandato"
                  action={
                    <Button onClick={() => setTaskDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Tarea
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">{task.priority}</Badge>
                          <Badge className={task.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {task.completed ? 'Completada' : 'Pendiente'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Vencimiento: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab de Personas */}
        <TabsContent value="people">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personas Involucradas
                </CardTitle>
                <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Persona
                    </Button>
                  </DialogTrigger>
                  <CreatePersonForm 
                    onSubmit={createPerson}
                    onClose={() => setPersonDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {people.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No hay personas registradas"
                  description="Añade la primera persona involucrada en este mandato"
                  action={
                    <Button onClick={() => setPersonDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Primera Persona
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-4">
                  {people.map((person) => (
                    <div key={person.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{person.name}</h4>
                        <Badge variant="outline">{person.role}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{person.company}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {person.email && <span>{person.email}</span>}
                        {person.phone && <span>{person.phone}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
