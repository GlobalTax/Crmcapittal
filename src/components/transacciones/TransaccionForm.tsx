
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Transaccion, TransaccionTipo, TransaccionPrioridad } from '@/types/Transaccion';
import { useStages } from '@/hooks/useStages';
import { useCompanies } from '@/hooks/useCompanies';
import { useContacts } from '@/hooks/useContacts';
import { CalendarIcon, Euro, Building2, Users } from 'lucide-react';

interface TransaccionFormProps {
  transaccion?: Transaccion;
  onSubmit: (data: Omit<Transaccion, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  initialStageId?: string;
}

const tiposTransaccion: { value: TransaccionTipo; label: string }[] = [
  { value: 'venta', label: 'Venta' },
  { value: 'compra', label: 'Compra' },
  { value: 'fusion', label: 'Fusión' },
  { value: 'valoracion', label: 'Valoración' },
  { value: 'consultoria', label: 'Consultoría' },
];

const prioridades: { value: TransaccionPrioridad; label: string }[] = [
  { value: 'baja', label: 'Baja' },
  { value: 'media', label: 'Media' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const monedas = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
];

export const TransaccionForm: React.FC<TransaccionFormProps> = ({
  transaccion,
  onSubmit,
  onCancel,
  initialStageId
}) => {
  const { stages } = useStages('DEAL');
  const { companies } = useCompanies();
  const { contacts } = useContacts();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre_transaccion: transaccion?.nombre_transaccion || '',
      company_id: transaccion?.company_id || '',
      contact_id: transaccion?.contact_id || '',
      valor_transaccion: transaccion?.valor_transaccion || 0,
      moneda: transaccion?.moneda || 'EUR',
      tipo_transaccion: transaccion?.tipo_transaccion || 'venta',
      stage_id: transaccion?.stage_id || initialStageId || '',
      prioridad: transaccion?.prioridad || 'media',
      propietario_transaccion: transaccion?.propietario_transaccion || '',
      ebitda: transaccion?.ebitda || 0,
      ingresos: transaccion?.ingresos || 0,
      multiplicador: transaccion?.multiplicador || 0,
      sector: transaccion?.sector || '',
      ubicacion: transaccion?.ubicacion || '',
      empleados: transaccion?.empleados || 0,
      descripcion: transaccion?.descripcion || '',
      fuente_lead: transaccion?.fuente_lead || '',
      proxima_actividad: transaccion?.proxima_actividad || '',
      notas: transaccion?.notas || '',
      fecha_cierre: transaccion?.fecha_cierre || '',
      is_active: transaccion?.is_active ?? true,
    }
  });

  const selectedCompanyId = watch('company_id');
  const filteredContacts = selectedCompanyId 
    ? contacts?.filter(contact => contact.company_id === selectedCompanyId) || []
    : contacts || [];

  const handleFormSubmit = async (data: any) => {
    try {
      await onSubmit({
        ...data,
        valor_transaccion: Number(data.valor_transaccion) || 0,
        ebitda: Number(data.ebitda) || 0,
        ingresos: Number(data.ingresos) || 0,
        multiplicador: Number(data.multiplicador) || 0,
        empleados: Number(data.empleados) || 0,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre_transaccion">Nombre de la Transacción *</Label>
              <Input
                id="nombre_transaccion"
                {...register('nombre_transaccion', { required: 'Este campo es obligatorio' })}
                placeholder="Ej: Adquisición de TechCorp"
              />
              {errors.nombre_transaccion && (
                <p className="text-sm text-destructive mt-1">{errors.nombre_transaccion.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tipo_transaccion">Tipo de Transacción</Label>
              <Select onValueChange={(value) => setValue('tipo_transaccion', value as TransaccionTipo)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposTransaccion.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="valor_transaccion">Valor de la Transacción</Label>
              <Input
                id="valor_transaccion"
                type="number"
                {...register('valor_transaccion')}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Select onValueChange={(value) => setValue('moneda', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="EUR" />
                </SelectTrigger>
                <SelectContent>
                  {monedas.map((moneda) => (
                    <SelectItem key={moneda.value} value={moneda.value}>
                      {moneda.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prioridad">Prioridad</Label>
              <Select onValueChange={(value) => setValue('prioridad', value as TransaccionPrioridad)}>
                <SelectTrigger>
                  <SelectValue placeholder="Media" />
                </SelectTrigger>
                <SelectContent>
                  {prioridades.map((prioridad) => (
                    <SelectItem key={prioridad.value} value={prioridad.value}>
                      {prioridad.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {stages && stages.length > 0 && (
            <div>
              <Label htmlFor="stage_id">Etapa</Label>
              <Select onValueChange={(value) => setValue('stage_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Empresa y Contactos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_id">Empresa</Label>
              <Select onValueChange={(value) => setValue('company_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact_id">Contacto</Label>
              <Select onValueChange={(value) => setValue('contact_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar contacto" />
                </SelectTrigger>
                <SelectContent>
                  {filteredContacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} {contact.email && `(${contact.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalles Financieros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ebitda">EBITDA</Label>
              <Input
                id="ebitda"
                type="number"
                {...register('ebitda')}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="ingresos">Ingresos</Label>
              <Input
                id="ingresos"
                type="number"
                {...register('ingresos')}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="multiplicador">Multiplicador</Label>
              <Input
                id="multiplicador"
                type="number"
                step="0.1"
                {...register('multiplicador')}
                placeholder="0.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sector">Sector</Label>
              <Input
                id="sector"
                {...register('sector')}
                placeholder="Ej: Tecnología"
              />
            </div>

            <div>
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                {...register('ubicacion')}
                placeholder="Ej: Madrid, España"
              />
            </div>

            <div>
              <Label htmlFor="empleados">Número de Empleados</Label>
              <Input
                id="empleados"
                type="number"
                {...register('empleados')}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="propietario_transaccion">Propietario</Label>
              <Input
                id="propietario_transaccion"
                {...register('propietario_transaccion')}
                placeholder="Nombre del responsable"
              />
            </div>

            <div>
              <Label htmlFor="fuente_lead">Fuente del Lead</Label>
              <Input
                id="fuente_lead"
                {...register('fuente_lead')}
                placeholder="Ej: Referido, Web, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fecha_cierre">Fecha de Cierre Estimada</Label>
              <Input
                id="fecha_cierre"
                type="date"
                {...register('fecha_cierre')}
              />
            </div>

            <div>
              <Label htmlFor="proxima_actividad">Próxima Actividad</Label>
              <Input
                id="proxima_actividad"
                {...register('proxima_actividad')}
                placeholder="Descripción de la próxima acción"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              {...register('descripcion')}
              placeholder="Descripción detallada de la transacción..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              {...register('notas')}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : (transaccion ? 'Actualizar' : 'Crear')} Transacción
        </Button>
      </div>
    </form>
  );
};
