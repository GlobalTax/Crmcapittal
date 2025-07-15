import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, FileText, Clock, Calendar, Search } from 'lucide-react';
import { CreatePlannedTaskData, PlannedTask } from '@/types/TimeTracking';
import { supabase } from '@/integrations/supabase/client';

const createTaskSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  estimated_duration: z.number().min(1, 'La duración debe ser mayor a 0').optional(),
  activity_type: z.string().min(1, 'El tipo de actividad es requerido'),
  lead_id: z.string().optional(),
  mandate_id: z.string().optional(),
  contact_id: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface EnhancedCreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (data: CreatePlannedTaskData) => Promise<PlannedTask | null>;
  defaultDate: string;
}

// Activity templates
const activityTemplates = [
  {
    id: 'call',
    title: 'Llamada comercial',
    activity_type: 'call',
    estimated_duration: 30,
    icon: Clock,
    description: 'Llamada de seguimiento con cliente o prospecto'
  },
  {
    id: 'meeting',
    title: 'Reunión presencial',
    activity_type: 'meeting',
    estimated_duration: 60,
    icon: User,
    description: 'Reunión cara a cara con cliente'
  },
  {
    id: 'research',
    title: 'Investigación de mercado',
    activity_type: 'research',
    estimated_duration: 120,
    icon: Search,
    description: 'Análisis e investigación del sector/empresa'
  },
  {
    id: 'documentation',
    title: 'Documentación',
    activity_type: 'documentation',
    estimated_duration: 45,
    icon: FileText,
    description: 'Preparación de documentos e informes'
  },
  {
    id: 'development',
    title: 'Desarrollo de propuesta',
    activity_type: 'development',
    estimated_duration: 90,
    icon: Building2,
    description: 'Preparación de propuesta comercial'
  },
];

export const EnhancedCreateTaskDialog: React.FC<EnhancedCreateTaskDialogProps> = ({
  open,
  onOpenChange,
  onCreateTask,
  defaultDate
}) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [mandates, setMandates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      estimated_duration: undefined,
      activity_type: '',
      lead_id: undefined,
      mandate_id: undefined,
      contact_id: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      loadProjectData();
    }
  }, [open]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      // Load leads
      const { data: leadsData } = await supabase
        .from('contacts')
        .select('id, name, email, company_name, lifecycle_stage')
        .eq('contact_type', 'lead')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      // Load mandates
      const { data: mandatesData } = await supabase
        .from('buying_mandates')
        .select('id, mandate_name, client_name, status, target_sectors')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      // Load contacts
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('id, name, email, company_name')
        .neq('contact_type', 'lead')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      setLeads(leadsData || []);
      setMandates(mandatesData || []);
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    try {
      const taskData: CreatePlannedTaskData = {
        title: data.title,
        description: data.description,
        date: defaultDate,
        estimated_duration: data.estimated_duration,
        lead_id: data.lead_id,
        mandate_id: data.mandate_id,
        contact_id: data.contact_id,
      };

      await onCreateTask(taskData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleTemplateSelect = (template: typeof activityTemplates[0]) => {
    form.setValue('title', template.title);
    form.setValue('activity_type', template.activity_type);
    form.setValue('estimated_duration', template.estimated_duration);
    form.setValue('description', template.description);
  };

  const filteredLeads = leads.filter(lead =>
    !searchQuery || lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (lead.company_name && lead.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredMandates = mandates.filter(mandate =>
    !searchQuery || mandate.mandate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mandate.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredContacts = contacts.filter(contact =>
    !searchQuery || contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.company_name && contact.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Plantillas</TabsTrigger>
            <TabsTrigger value="custom">Personalizada</TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {activityTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-auto p-4 flex items-start justify-start text-left"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <template.icon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.estimated_duration}min
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título de la Tarea</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Llamada de seguimiento con cliente"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activity_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Actividad</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo de actividad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="call">Llamada</SelectItem>
                          <SelectItem value="meeting">Reunión</SelectItem>
                          <SelectItem value="research">Investigación</SelectItem>
                          <SelectItem value="documentation">Documentación</SelectItem>
                          <SelectItem value="development">Desarrollo</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detalles adicionales sobre la tarea..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimated_duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración Estimada (minutos)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Assignment */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Asignar a Proyecto (Opcional)</h3>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar leads, mandatos o contactos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <Tabs defaultValue="leads" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="leads">Leads ({filteredLeads.length})</TabsTrigger>
                      <TabsTrigger value="mandates">Mandatos ({filteredMandates.length})</TabsTrigger>
                      <TabsTrigger value="contacts">Contactos ({filteredContacts.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="leads" className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredLeads.map((lead) => (
                        <FormField
                          key={lead.id}
                          control={form.control}
                          name="lead_id"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={field.value === lead.id ? "default" : "outline"}
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => {
                                form.setValue('lead_id', field.value === lead.id ? undefined : lead.id);
                                form.setValue('mandate_id', undefined);
                                form.setValue('contact_id', undefined);
                              }}
                            >
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                {lead.company_name && (
                                  <p className="text-sm text-muted-foreground">{lead.company_name}</p>
                                )}
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {lead.lifecycle_stage || 'Lead'}
                                </Badge>
                              </div>
                            </Button>
                          )}
                        />
                      ))}
                      {filteredLeads.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No se encontraron leads
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="mandates" className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredMandates.map((mandate) => (
                        <FormField
                          key={mandate.id}
                          control={form.control}
                          name="mandate_id"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={field.value === mandate.id ? "default" : "outline"}
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => {
                                form.setValue('mandate_id', field.value === mandate.id ? undefined : mandate.id);
                                form.setValue('lead_id', undefined);
                                form.setValue('contact_id', undefined);
                              }}
                            >
                              <div>
                                <p className="font-medium">{mandate.mandate_name}</p>
                                <p className="text-sm text-muted-foreground">{mandate.client_name}</p>
                                <div className="flex gap-1 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {mandate.status}
                                  </Badge>
                                  {mandate.target_sectors && mandate.target_sectors.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {mandate.target_sectors[0]}
                                      {mandate.target_sectors.length > 1 && ` +${mandate.target_sectors.length - 1}`}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </Button>
                          )}
                        />
                      ))}
                      {filteredMandates.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No se encontraron mandatos
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="contacts" className="space-y-2 max-h-40 overflow-y-auto">
                      {filteredContacts.map((contact) => (
                        <FormField
                          key={contact.id}
                          control={form.control}
                          name="contact_id"
                          render={({ field }) => (
                            <Button
                              type="button"
                              variant={field.value === contact.id ? "default" : "outline"}
                              className="w-full justify-start text-left h-auto p-3"
                              onClick={() => {
                                form.setValue('contact_id', field.value === contact.id ? undefined : contact.id);
                                form.setValue('lead_id', undefined);
                                form.setValue('mandate_id', undefined);
                              }}
                            >
                              <div>
                                <p className="font-medium">{contact.name}</p>
                                {contact.company_name && (
                                  <p className="text-sm text-muted-foreground">{contact.company_name}</p>
                                )}
                              </div>
                            </Button>
                          )}
                        />
                      ))}
                      {filteredContacts.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No se encontraron contactos
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Crear Tarea
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};