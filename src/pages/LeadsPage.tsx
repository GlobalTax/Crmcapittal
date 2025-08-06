import React, { useState } from 'react';
import { useLeadContacts } from '@/hooks/useLeadContacts';
import { useLeadTasks } from '@/hooks/useLeadTasksSimple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, User, Building, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const createLeadSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  lead_source: z.string().optional(),
  notes: z.string().optional(),
});

type CreateLeadFormData = z.infer<typeof createLeadSchema>;

const createTaskSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const { leads, isLoading, createLead, updateLead, deleteLead, convertLead } = useLeadContacts({
    status: statusFilter || undefined,
  });

  const { tasks, createTask, updateTask, deleteTask } = useLeadTasks(selectedLead || '');

  const createLeadForm = useForm<CreateLeadFormData>({
    resolver: zodResolver(createLeadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      lead_source: 'manual',
      notes: '',
    },
  });

  const createTaskForm = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const filteredLeads = leads.filter(lead => 
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onCreateLead = async (data: CreateLeadFormData) => {
    try {
      const leadName = `${data.name} - ${new Date().toLocaleDateString('es-ES')}`;
      await createLead({
        ...data,
        name: leadName,
        contact_type: 'lead',
      });
      createLeadForm.reset();
      setIsCreateLeadOpen(false);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const onCreateTask = async (data: CreateTaskFormData) => {
    if (!selectedLead) return;
    
    try {
      await createTask({
        lead_id: selectedLead,
        title: data.title,
        description: data.description,
        due_date: data.due_date,
        priority: data.priority,
      });
      createTaskForm.reset();
      setIsCreateTaskOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleConvertLead = async (leadId: string) => {
    try {
      await convertLead(leadId);
      toast.success('Lead convertido a cliente exitosamente');
    } catch (error) {
      console.error('Error converting lead:', error);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'NEW': return <Badge variant="secondary">Nuevo</Badge>;
      case 'CONTACTED': return <Badge variant="outline">Contactado</Badge>;
      case 'QUALIFIED': return <Badge variant="default">Calificado</Badge>;
      case 'NURTURING': return <Badge className="bg-orange-500">Nutrición</Badge>;
      case 'CONVERTED': return <Badge className="bg-green-500">Convertido</Badge>;
      default: return <Badge variant="secondary">Sin estado</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Leads</h1>
          <p className="text-muted-foreground">Administra y convierte tus leads en clientes</p>
        </div>
        
        <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Lead</DialogTitle>
            </DialogHeader>
            <Form {...createLeadForm}>
              <form onSubmit={createLeadForm.handleSubmit(onCreateLead)} className="space-y-4">
                <FormField
                  control={createLeadForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del lead" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createLeadForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createLeadForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input placeholder="+34 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createLeadForm.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Nombre de la empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={createLeadForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO, Director, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createLeadForm.control}
                  name="lead_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la fuente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="website">Página web</SelectItem>
                          <SelectItem value="referral">Referido</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="event">Evento</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createLeadForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre el lead"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateLeadOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Lead</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los estados</SelectItem>
            <SelectItem value="NEW">Nuevo</SelectItem>
            <SelectItem value="CONTACTED">Contactado</SelectItem>
            <SelectItem value="QUALIFIED">Calificado</SelectItem>
            <SelectItem value="NURTURING">Nutrición</SelectItem>
            <SelectItem value="CONVERTED">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-xs text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.lead_status === 'QUALIFIED').length}
                </p>
                <p className="text-xs text-muted-foreground">Calificados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.lead_status === 'NURTURING').length}
                </p>
                <p className="text-xs text-muted-foreground">En Nutrición</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {leads.filter(l => l.lead_status === 'CONVERTED').length}
                </p>
                <p className="text-xs text-muted-foreground">Convertidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{lead.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                  {lead.company && (
                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                  )}
                </div>
                {getStatusBadge(lead.lead_status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lead.phone && (
                  <p className="text-sm"><strong>Teléfono:</strong> {lead.phone}</p>
                )}
                {lead.position && (
                  <p className="text-sm"><strong>Cargo:</strong> {lead.position}</p>
                )}
                {lead.lead_source && (
                  <p className="text-sm"><strong>Fuente:</strong> {lead.lead_source}</p>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLead(lead.id);
                      setIsCreateTaskOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tarea
                  </Button>
                  
                  {lead.lead_status !== 'CONVERTED' && (
                    <Button
                      size="sm"
                      onClick={() => handleConvertLead(lead.id)}
                    >
                      Convertir
                    </Button>
                  )}
                </div>

                {/* Tasks for this lead */}
                {selectedLead === lead.id && tasks.length > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <h4 className="text-sm font-medium mb-2">Tareas:</h4>
                    <div className="space-y-2">
                      {tasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            {getPriorityIcon(task.priority)}
                            <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                              {task.title}
                            </span>
                          </div>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No se encontraron leads</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter 
                  ? 'Intenta cambiar los filtros de búsqueda'
                  : 'Comienza creando tu primer lead'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Tarea</DialogTitle>
          </DialogHeader>
          <Form {...createTaskForm}>
            <form onSubmit={createTaskForm.handleSubmit(onCreateTask)} className="space-y-4">
              <FormField
                control={createTaskForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Título de la tarea" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createTaskForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descripción de la tarea"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createTaskForm.control}
                  name="due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha límite</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createTaskForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Baja</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Crear Tarea</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsPage;