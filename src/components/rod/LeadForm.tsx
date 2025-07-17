import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Trash2, Edit3, Building, Euro, Star, Mail, Phone, User } from 'lucide-react';
import { RODLead } from '@/hooks/useRODFormState';

const leadSchema = z.object({
  companyName: z.string().min(1, 'Nombre de empresa requerido'),
  sector: z.string().min(1, 'Sector requerido'),
  estimatedValue: z.number().min(1, 'Valor estimado debe ser mayor a 0'),
  leadScore: z.number().min(1).max(100, 'Lead score debe estar entre 1-100'),
  leadSource: z.string().min(1, 'Fuente del lead requerida'),
  qualificationStatus: z.string().min(1, 'Estado de cualificación requerido'),
  contactName: z.string().min(1, 'Nombre de contacto requerido'),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().min(1, 'Teléfono requerido'),
  notes: z.string().min(10, 'Notas deben tener al menos 10 caracteres'),
});

type LeadFormData = Omit<RODLead, 'id'>;

interface LeadFormProps {
  leads: RODLead[];
  onAddLead: (lead: LeadFormData) => void;
  onUpdateLead: (id: string, lead: Partial<RODLead>) => void;
  onRemoveLead: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const sectors = [
  'Tecnología', 'Salud', 'Finanzas', 'Educación', 'Retail', 'Manufactura',
  'Servicios', 'Construcción', 'Alimentación', 'Turismo', 'Otro'
];

const leadSources = [
  'Web', 'Referencia', 'LinkedIn', 'Email marketing', 'Eventos', 'Telemarketing', 'Otro'
];

const qualificationStatuses = [
  'Cualificado', 'En proceso', 'No cualificado', 'Nurturing', 'Contactado', 'Pendiente'
];

export function LeadForm({ 
  leads, 
  onAddLead, 
  onUpdateLead, 
  onRemoveLead, 
  onNext, 
  onPrev 
}: LeadFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: '',
      sector: '',
      estimatedValue: 0,
      leadScore: 50,
      leadSource: '',
      qualificationStatus: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
  });

  const onSubmit = (data: LeadFormData) => {
    if (editingId) {
      onUpdateLead(editingId, data);
      setEditingId(null);
    } else {
      onAddLead(data);
    }
    form.reset();
    setShowForm(false);
  };

  const handleEdit = (lead: RODLead) => {
    setEditingId(lead.id);
    form.reset(lead);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    form.reset();
  };

  const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const averageScore = leads.length > 0 
    ? Math.round(leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length)
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Leads Potenciales
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Añade los leads potenciales que incluirás en la ROD
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Badge variant="outline" className="px-3 py-1">
              {leads.length} leads
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              Valor estimado: €{totalValue.toLocaleString()}
            </Badge>
            {leads.length > 0 && (
              <Badge variant="outline" className="px-3 py-1">
                Score promedio: {averageScore}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Add Lead Button */}
      {!showForm && (
        <Card className="border-dashed border-2 border-muted hover:border-primary transition-colors">
          <CardContent className="p-6">
            <Button 
              onClick={() => setShowForm(true)}
              variant="ghost" 
              className="w-full h-20 border-none"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <span className="text-muted-foreground">Añadir Lead Potencial</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lead Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Lead' : 'Nuevo Lead Potencial'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          Nombre de la Empresa
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa Potencial S.L." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un sector" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sectors.map((sector) => (
                              <SelectItem key={sector} value={sector}>
                                {sector}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          Valor Estimado (€)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Lead Score (1-100)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            max="100"
                            placeholder="75"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="leadSource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente del Lead</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona la fuente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leadSources.map((source) => (
                              <SelectItem key={source} value={source}>
                                {source}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="qualificationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado de Cualificación</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {qualificationStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Contacto Principal
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="María García" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="contacto@lead.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Teléfono
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+34 600 000 000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionales</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Información adicional sobre el lead, intereses, necesidades específicas..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? 'Actualizar' : 'Añadir'} Lead
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Leads Añadidos ({leads.length})</h3>
          {leads.map((lead) => (
            <Card key={lead.id} className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{lead.companyName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{lead.sector}</Badge>
                      <span>•</span>
                      <Star className="h-3 w-3" />
                      <span>Score: {lead.leadScore}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(lead)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRemoveLead(lead.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-medium text-green-600">€{lead.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fuente:</span>
                    <p className="font-medium">{lead.leadSource}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium">{lead.qualificationStatus}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contacto:</span>
                    <p className="font-medium">{lead.contactName}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lead.notes}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <Button 
          onClick={onNext}
          disabled={leads.length === 0}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}