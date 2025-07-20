import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useTransacciones } from '@/hooks/useTransacciones';
import { useStages } from '@/hooks/useStages';
import { useCompanies } from '@/hooks/useCompanies';
import { useContacts } from '@/hooks/useContacts';
import { TransaccionTipo, TransaccionPrioridad } from '@/types/Transaccion';

interface NewTransaccionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStageId?: string;
}

// Validation schema
const transaccionSchema = z.object({
  nombre_transaccion: z.string().min(1, 'El nombre de la transacción es requerido'),
  tipo_transaccion: z.enum(['venta', 'compra', 'fusion', 'valoracion', 'consultoria']),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']),
  stage_id: z.string().optional(),
  company_id: z.string().optional(),
  contact_id: z.string().optional(),
  valor_transaccion: z.number().positive().optional(),
  moneda: z.string().default('EUR'),
  sector: z.string().optional(),
  descripcion: z.string().optional(),
  propietario_transaccion: z.string().optional(),
});

type TransaccionFormData = z.infer<typeof transaccionSchema>;

export const NewTransaccionModal = ({ open, onOpenChange, defaultStageId }: NewTransaccionModalProps) => {
  const { createTransaccion } = useTransacciones();
  const { stages } = useStages('DEAL');
  const { companies, isLoading: isLoadingCompanies } = useCompanies({ limit: 100 });
  const { contacts, isLoading: isLoadingContacts } = useContacts();
  const [createMore, setCreateMore] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<TransaccionFormData>({
    resolver: zodResolver(transaccionSchema),
    defaultValues: {
      nombre_transaccion: '',
      tipo_transaccion: 'venta',
      prioridad: 'media',
      stage_id: defaultStageId || '',
      company_id: '',
      contact_id: '',
      valor_transaccion: undefined,
      moneda: 'EUR',
      sector: '',
      descripcion: '',
      propietario_transaccion: '',
    }
  });

  // Set initial focus and keyboard shortcuts
  useEffect(() => {
    if (open) {
      if (defaultStageId) {
        setValue('stage_id', defaultStageId);
      }
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleSubmit(onSubmit)();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, defaultStageId, setValue, handleSubmit]);

  const onSubmit = async (data: TransaccionFormData) => {
    const result = await createTransaccion({
      nombre_transaccion: data.nombre_transaccion,
      tipo_transaccion: data.tipo_transaccion,
      prioridad: data.prioridad,
      stage_id: data.stage_id,
      company_id: data.company_id,
      contact_id: data.contact_id,
      valor_transaccion: data.valor_transaccion,
      moneda: data.moneda,
      sector: data.sector,
      descripcion: data.descripcion,
      propietario_transaccion: data.propietario_transaccion,
      is_active: true,
    });
    
    if (result.error === null) {
      if (createMore) {
        reset({
          nombre_transaccion: '',
          tipo_transaccion: 'venta',
          prioridad: 'media',
          stage_id: defaultStageId || '',
          company_id: '',
          contact_id: '',
          valor_transaccion: undefined,
          moneda: 'EUR',
          sector: '',
          descripcion: '',
          propietario_transaccion: '',
        });
      } else {
        reset();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-neutral-0 p-0 gap-0">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-8 pb-0">
          <div className="flex-1">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2"
                >
                  Nueva Transacción
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex items-center justify-center w-6 h-6 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form content */}
        <div className="p-8 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nombre de la transacción - Required */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Nombre de la transacción *
              </Label>
              <Controller
                name="nombre_transaccion"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Ej: Adquisición de TechCorp"
                    className="w-full placeholder:text-neutral-400"
                    autoFocus
                  />
                )}
              />
              {errors.nombre_transaccion && (
                <p className="text-xs text-red-500">{errors.nombre_transaccion.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de transacción */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Tipo de transacción *
                </Label>
                <Controller
                  name="tipo_transaccion"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venta">Venta</SelectItem>
                        <SelectItem value="compra">Compra</SelectItem>
                        <SelectItem value="fusion">Fusión</SelectItem>
                        <SelectItem value="valoracion">Valoración</SelectItem>
                        <SelectItem value="consultoria">Consultoría</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Prioridad *
                </Label>
                <Controller
                  name="prioridad"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Etapa */}
            {stages.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Etapa
                </Label>
                <Controller
                  name="stage_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
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
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Empresa asociada */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Empresa asociada
                </Label>
                <Controller
                  name="company_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
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
                  )}
                />
              </div>

              {/* Contacto asociado */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Contacto principal
                </Label>
                <Controller
                  name="contact_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar contacto" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} {contact.email && `(${contact.email})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Valor */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Valor de la transacción
                </Label>
                <Controller
                  name="valor_transaccion"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                        €
                      </span>
                      <Input
                        {...field}
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        className="w-full pl-8 placeholder:text-neutral-400"
                        min="0"
                        step="1000"
                      />
                    </div>
                  )}
                />
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-neutral-500">
                  Sector
                </Label>
                <Controller
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Ej: Tecnología, Salud..."
                      className="w-full placeholder:text-neutral-400"
                    />
                  )}
                />
              </div>
            </div>

            {/* Propietario */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Responsable de la transacción
              </Label>
              <Controller
                name="propietario_transaccion"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nombre del responsable"
                    className="w-full placeholder:text-neutral-400"
                  />
                )}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-neutral-500">
                Descripción
              </Label>
              <Controller
                name="descripcion"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Descripción detallada de la transacción..."
                    className="w-full placeholder:text-neutral-400 min-h-[80px]"
                    rows={3}
                  />
                )}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                />
                <Label htmlFor="create-more" className="text-sm text-neutral-600">
                  Crear otra
                </Label>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-hover text-neutral-0"
              >
                {isSubmitting ? 'Creando...' : 'Crear transacción'} 
                <span className="ml-2 text-xs opacity-70">⌃ ↩</span>
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};