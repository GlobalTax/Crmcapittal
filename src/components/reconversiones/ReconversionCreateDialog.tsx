import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReconversionFormData {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  rejection_reason: string;
  target_sectors: string[];
  investment_capacity_min: number;
  investment_capacity_max: number;
  geographic_preferences: string[];
  business_model_preferences: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'active' | 'matching' | 'converted' | 'closed';
  notes: string;
}

interface ReconversionCreateDialogProps {
  onCreateReconversion: (data: Partial<ReconversionFormData>) => Promise<any>;
}

export function ReconversionCreateDialog({ onCreateReconversion }: ReconversionCreateDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ReconversionFormData>({
    defaultValues: {
      priority: 'medium',
      status: 'draft',
      target_sectors: [],
      geographic_preferences: [],
      business_model_preferences: []
    }
  });

  const onSubmit = async (data: ReconversionFormData) => {
    setSubmitting(true);
    try {
      // Convertir strings a arrays
      const formattedData = {
        ...data,
        target_sectors: data.target_sectors.length > 0 ? data.target_sectors : [],
        geographic_preferences: data.geographic_preferences.length > 0 ? data.geographic_preferences : [],
        business_model_preferences: data.business_model_preferences.length > 0 ? data.business_model_preferences : []
      };

      const result = await onCreateReconversion(formattedData);
      if (result) {
        setOpen(false);
        reset();
        toast.success('Reconversión creada exitosamente');
      }
    } catch (error) {
      console.error('Error creating reconversion:', error);
      toast.error('Error al crear la reconversión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reconversión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Reconversión</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nombre de la Empresa *</Label>
              <Input
                id="company_name"
                {...register('company_name', { required: 'Este campo es obligatorio' })}
                placeholder="Nombre de la empresa"
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre del Contacto *</Label>
              <Input
                id="contact_name"
                {...register('contact_name', { required: 'Este campo es obligatorio' })}
                placeholder="Nombre del contacto"
              />
              {errors.contact_name && (
                <p className="text-sm text-destructive">{errors.contact_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_email">Email del Contacto *</Label>
              <Input
                id="contact_email"
                type="email"
                {...register('contact_email', { 
                  required: 'Este campo es obligatorio',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="email@ejemplo.com"
              />
              {errors.contact_email && (
                <p className="text-sm text-destructive">{errors.contact_email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono del Contacto</Label>
              <Input
                id="contact_phone"
                {...register('contact_phone')}
                placeholder="+34 900 000 000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select onValueChange={(value) => setValue('status', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="matching">En Matching</SelectItem>
                  <SelectItem value="converted">Convertido</SelectItem>
                  <SelectItem value="closed">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Motivo del Rechazo *</Label>
            <Textarea
              id="rejection_reason"
              {...register('rejection_reason', { required: 'Este campo es obligatorio' })}
              placeholder="Describe el motivo por el que se rechazó inicialmente..."
              rows={3}
            />
            {errors.rejection_reason && (
              <p className="text-sm text-destructive">{errors.rejection_reason.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment_capacity_min">Capacidad Inversión Mínima (€)</Label>
              <Input
                id="investment_capacity_min"
                type="number"
                {...register('investment_capacity_min', { valueAsNumber: true })}
                placeholder="50000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment_capacity_max">Capacidad Inversión Máxima (€)</Label>
              <Input
                id="investment_capacity_max"
                type="number"
                {...register('investment_capacity_max', { valueAsNumber: true })}
                placeholder="500000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Información adicional sobre la reconversión..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear Reconversión'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}