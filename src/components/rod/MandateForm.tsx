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
import { HandCoins, Plus, Trash2, Edit3, Building, MapPin, Euro, Phone, Mail, User, TestTube } from 'lucide-react';
import { RODMandate } from '@/hooks/useRODFormState';
import { ImportDataDialog } from './ImportDataDialog';
import { useTestData } from '@/hooks/useTestData';

const mandateSchema = z.object({
  companyName: z.string().min(1, 'Nombre de empresa requerido'),
  sector: z.string().min(1, 'Sector requerido'),
  location: z.string().min(1, 'Ubicación requerida'),
  salesAmount: z.number().min(1, 'Importe debe ser mayor a 0'),
  ebitda: z.number().optional(),
  description: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
  status: z.string().min(1, 'Estado requerido'),
  contactName: z.string().min(1, 'Nombre de contacto requerido'),
  contactEmail: z.string().email('Email inválido'),
  contactPhone: z.string().min(1, 'Teléfono requerido'),
});

type MandateFormData = Omit<RODMandate, 'id'>;

interface MandateFormProps {
  mandates: RODMandate[];
  onAddMandate: (mandate: MandateFormData) => void;
  onUpdateMandate: (id: string, mandate: Partial<RODMandate>) => void;
  onRemoveMandate: (id: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onImportMandates?: (mandates: MandateFormData[]) => void;
}

const sectors = [
  'Tecnología', 'Salud', 'Finanzas', 'Educación', 'Retail', 'Manufactura',
  'Servicios', 'Construcción', 'Alimentación', 'Turismo', 'Otro'
];

const statuses = [
  'Disponible', 'En proceso', 'Pendiente revisión', 'Aprobado', 'Rechazado'
];

export function MandateForm({ 
  mandates, 
  onAddMandate, 
  onUpdateMandate, 
  onRemoveMandate, 
  onNext, 
  onPrev,
  onImportMandates
}: MandateFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { sampleMandates } = useTestData();

  const form = useForm<MandateFormData>({
    resolver: zodResolver(mandateSchema),
    defaultValues: {
      companyName: '',
      sector: '',
      location: '',
      salesAmount: 0,
      ebitda: undefined,
      description: '',
      status: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  const onSubmit = (data: MandateFormData) => {
    if (editingId) {
      onUpdateMandate(editingId, data);
      setEditingId(null);
    } else {
      onAddMandate(data);
    }
    form.reset();
    setShowForm(false);
  };

  const handleEdit = (mandate: RODMandate) => {
    setEditingId(mandate.id);
    form.reset(mandate);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    form.reset({
      companyName: '',
      sector: '',
      location: '',
      salesAmount: 0,
      ebitda: undefined,
      description: '',
      status: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
    });
  };

  const totalValue = mandates.reduce((sum, mandate) => sum + mandate.salesAmount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HandCoins className="h-5 w-5" />
            Mandatos de Venta
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Añade los mandatos de venta que incluirás en la ROD
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline" className="px-3 py-1">
                {mandates.length} mandatos
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                Valor total: €{totalValue.toLocaleString()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {mandates.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    sampleMandates.forEach(mandate => onAddMandate(mandate));
                  }}
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Cargar Datos de Prueba
                </Button>
              )}
              {onImportMandates && (
                <ImportDataDialog onImportMandates={onImportMandates} />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Add Mandate Button */}
      {!showForm && (
        <Card className="border-dashed border-2 border-muted hover:border-primary transition-colors">
          <CardContent className="p-6">
            <Button 
              onClick={() => {
                form.reset({
                  companyName: '',
                  sector: '',
                  location: '',
                  salesAmount: 0,
                  ebitda: undefined,
                  description: '',
                  status: '',
                  contactName: '',
                  contactEmail: '',
                  contactPhone: '',
                });
                setShowForm(true);
              }}
              variant="ghost" 
              className="w-full h-20 border-none"
            >
              <div className="text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <span className="text-muted-foreground">Añadir Mandato de Venta</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Mandate Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Mandato' : 'Nuevo Mandato de Venta'}
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
                          <Input placeholder="Empresa S.L." {...field} />
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
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Ubicación
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Madrid, España" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salesAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          Importe de Venta (€)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1000000"
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
                    name="ebitda"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>EBITDA (€) - Opcional</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="150000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statuses.map((status) => (
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción del Negocio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe la empresa, su actividad principal, ventajas competitivas..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
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
                          <Input placeholder="Juan Pérez" {...field} />
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
                          <Input placeholder="contacto@empresa.com" {...field} />
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

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingId ? 'Actualizar' : 'Añadir'} Mandato
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Mandates List */}
      {mandates.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mandatos Añadidos ({mandates.length})</h3>
          {mandates.map((mandate) => (
            <Card key={mandate.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{mandate.companyName}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{mandate.sector}</Badge>
                      <span>•</span>
                      <MapPin className="h-3 w-3" />
                      <span>{mandate.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEdit(mandate)}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onRemoveMandate(mandate.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Importe:</span>
                    <p className="font-medium text-green-600">€{mandate.salesAmount.toLocaleString()}</p>
                  </div>
                  {mandate.ebitda && (
                    <div>
                      <span className="text-muted-foreground">EBITDA:</span>
                      <p className="font-medium text-blue-600">€{mandate.ebitda.toLocaleString()}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <p className="font-medium">{mandate.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Contacto:</span>
                    <p className="font-medium">{mandate.contactName}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {mandate.description}
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
        <Button onClick={onNext}>
          Continuar {mandates.length === 0 && '(Sin Mandatos)'}
        </Button>
      </div>
    </div>
  );
}