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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Search } from 'lucide-react';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { supabase } from '@/integrations/supabase/client';

const manualEntrySchema = z.object({
  activity_type: z.string().min(1, 'El tipo de actividad es requerido'),
  description: z.string().optional(),
  start_time: z.string().min(1, 'La hora de inicio es requerida'),
  end_time: z.string().min(1, 'La hora de fin es requerida'),
  is_billable: z.boolean().default(true),
  lead_id: z.string().optional(),
  mandate_id: z.string().optional(),
  contact_id: z.string().optional(),
  hourly_rate: z.number().optional(),
});

type ManualEntryFormData = z.infer<typeof manualEntrySchema>;

interface EnhancedManualTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData?: {
    activity_type?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    lead_id?: string;
    mandate_id?: string;
    contact_id?: string;
    is_billable?: boolean;
  };
}

export const EnhancedManualTimeEntryDialog: React.FC<EnhancedManualTimeEntryDialogProps> = ({
  open,
  onOpenChange,
  prefilledData
}) => {
  const today = new Date().toISOString().split('T')[0];
  const { createManualEntry } = useTimeTracking(today);

  const [leads, setLeads] = useState<any[]>([]);
  const [mandates, setMandates] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<ManualEntryFormData>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      activity_type: prefilledData?.activity_type || 'general',
      description: prefilledData?.description || '',
      start_time: prefilledData?.start_time || '',
      end_time: prefilledData?.end_time || '',
      is_billable: prefilledData?.is_billable ?? true,
      lead_id: prefilledData?.lead_id,
      mandate_id: prefilledData?.mandate_id,
      contact_id: prefilledData?.contact_id,
      hourly_rate: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      loadProjectData();
      if (prefilledData) {
        Object.entries(prefilledData).forEach(([key, value]) => {
          if (value !== undefined) {
            form.setValue(key as keyof ManualEntryFormData, value);
          }
        });
      }
    }
  }, [open, prefilledData]);

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

  const onSubmit = async (data: ManualEntryFormData) => {
    try {
      const startDateTime = `${today}T${data.start_time}:00Z`;
      const endDateTime = `${today}T${data.end_time}:00Z`;

      await createManualEntry({
        activity_type: data.activity_type,
        description: data.description,
        start_time: startDateTime,
        end_time: endDateTime,
        is_billable: data.is_billable,
        lead_id: data.lead_id,
        mandate_id: data.mandate_id,
        contact_id: data.contact_id,
        hourly_rate: data.hourly_rate,
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating manual entry:', error);
    }
  };

  const calculateDuration = () => {
    const startTime = form.watch('start_time');
    const endTime = form.watch('end_time');
    
    if (startTime && endTime) {
      const start = new Date(`${today}T${startTime}:00`);
      const end = new Date(`${today}T${endTime}:00`);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      if (diffMinutes > 0) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
      }
    }
    return null;
  };

  const duration = calculateDuration();

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
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Añadir Entrada Manual de Tiempo
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="activity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Actividad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar tipo" />
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
                name="hourly_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa/hora (€) - Opcional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="75.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Qué trabajaste en este tiempo?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time Range */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Inicio</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <div className="bg-muted p-3 rounded-md w-full text-center">
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-mono font-semibold">
                    {duration || '0m'}
                  </p>
                </div>
              </div>
            </div>

            {/* Billable switch */}
            <FormField
              control={form.control}
              name="is_billable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Tiempo Facturable</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      ¿Este tiempo puede ser facturado al cliente?
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                Guardar Entrada
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};