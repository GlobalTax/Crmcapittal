import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { CreateBuyingMandateData } from '@/types/BuyingMandate';
import { FormValidationProvider, useFormValidation } from '@/contexts/FormValidationContext';
import { ValidatedInput } from '@/components/validation/ValidatedInput';
import { mandateValidationRules } from '@/utils/entityValidationRules';
import { useLeads } from '@/hooks/useLeads';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface CreateMandateDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  initialData?: Partial<CreateBuyingMandateData>;
  leadId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const CreateMandateForm = ({ onSuccess, initialData, leadId }: { onSuccess?: () => void; initialData?: Partial<CreateBuyingMandateData>; leadId?: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectorInput, setSectorInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const { createMandate } = useBuyingMandates();
  const { validateForm, canSave, resetValidation } = useFormValidation();
  const { updateLead } = useLeads();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateBuyingMandateData>({
    client_name: initialData?.client_name || '',
    client_contact: initialData?.client_contact || '',
    client_email: initialData?.client_email || '',
    client_phone: initialData?.client_phone || '',
    mandate_name: initialData?.mandate_name || '',
    target_sectors: initialData?.target_sectors || [],
    target_locations: initialData?.target_locations || [],
    min_revenue: initialData?.min_revenue || undefined,
    max_revenue: initialData?.max_revenue || undefined,
    min_ebitda: initialData?.min_ebitda || undefined,
    max_ebitda: initialData?.max_ebitda || undefined,
    other_criteria: initialData?.other_criteria || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form including target_sectors requirement
    const validationData = { ...formData, target_sectors: formData.target_sectors.length > 0 ? 'valid' : '' };
    const validationResult = validateForm(validationData, mandateValidationRules);
    
    if (!validationResult.isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Creating mandate with data:', formData);
      
      const mandate = await createMandate(formData);
      console.log('Mandate created successfully:', mandate);
      
      // Si el mandato se creó desde un lead, actualizar el estado del lead
      if (leadId && mandate) {
        try {
          console.log('Updating lead status for leadId:', leadId);
          await updateLead({ 
            id: leadId, 
            updates: { 
              stage: 'ganado',
              status: 'CONVERTED'
            } 
          });
          console.log('Lead updated successfully');
        } catch (error) {
          console.warn('Error updating lead status:', error);
          // No bloquear el flujo si falla la actualización del lead
        }
      }
      
      resetValidation();
      setFormData({
        client_name: '',
        client_contact: '',
        client_email: '',
        client_phone: '',
        mandate_name: '',
        target_sectors: [],
        target_locations: [],
        min_revenue: undefined,
        max_revenue: undefined,
        min_ebitda: undefined,
        max_ebitda: undefined,
        other_criteria: '',
      });
      
      // Cerrar modal primero
      onSuccess?.();
      
      // Toast de éxito y redirección si viene de lead
      if (leadId) {
        toast.success('¡Mandato creado exitosamente!', {
          description: 'El lead ha sido convertido. Redirigiendo a mandatos...',
        });
        
        console.log('Navigating to /mandatos');
        // Redirección inmediata a mandatos
        navigate('/mandatos');
      } else {
        toast.success('¡Mandato creado exitosamente!');
      }
      
    } catch (error) {
      console.error('Error creating mandate:', error);
      toast.error('Error al crear el mandato', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSector = () => {
    if (sectorInput.trim() && !formData.target_sectors.includes(sectorInput.trim())) {
      setFormData(prev => ({
        ...prev,
        target_sectors: [...prev.target_sectors, sectorInput.trim()]
      }));
      setSectorInput('');
    }
  };

  const removeSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      target_sectors: prev.target_sectors.filter(s => s !== sector)
    }));
  };

  const addLocation = () => {
    if (locationInput.trim() && !formData.target_locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        target_locations: [...prev.target_locations, locationInput.trim()]
      }));
      setLocationInput('');
    }
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      target_locations: prev.target_locations.filter(l => l !== location)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información del Cliente</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_name">Nombre del Cliente *</Label>
            <ValidatedInput
              name="client_name"
              value={formData.client_name}
              onChange={(value) => setFormData(prev => ({...prev, client_name: value}))}
              validation={{ required: true, minLength: 2, maxLength: 100 }}
              placeholder="Empresa o persona"
            />
          </div>
          <div>
            <Label htmlFor="client_contact">Contacto Principal *</Label>
            <ValidatedInput
              name="client_contact"
              value={formData.client_contact}
              onChange={(value) => setFormData(prev => ({...prev, client_contact: value}))}
              validation={{ required: true, minLength: 2, maxLength: 100 }}
              placeholder="Nombre de la persona de contacto"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client_email">Email</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => setFormData(prev => ({...prev, client_email: e.target.value}))}
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <Label htmlFor="client_phone">Teléfono</Label>
            <Input
              id="client_phone"
              value={formData.client_phone}
              onChange={(e) => setFormData(prev => ({...prev, client_phone: e.target.value}))}
              placeholder="+34 600 000 000"
            />
          </div>
        </div>
      </div>

      {/* Mandate Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información del Mandato</h3>
        <div>
          <Label htmlFor="mandate_name">Nombre del Mandato *</Label>
          <ValidatedInput
            name="mandate_name"
            value={formData.mandate_name}
            onChange={(value) => setFormData(prev => ({...prev, mandate_name: value}))}
            validation={{ required: true, minLength: 5, maxLength: 200 }}
            placeholder="Ej: Búsqueda empresas tecnológicas Madrid"
          />
        </div>

        {/* Target Sectors */}
        <div>
          <Label>Sectores Objetivo</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={sectorInput}
              onChange={(e) => setSectorInput(e.target.value)}
              placeholder="Añadir sector..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSector())}
            />
            <Button type="button" onClick={addSector} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.target_sectors.map((sector) => (
              <Badge key={sector} variant="secondary" className="flex items-center gap-1">
                {sector}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeSector(sector)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Target Locations */}
        <div>
          <Label>Ubicaciones Objetivo</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Añadir ubicación..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
            />
            <Button type="button" onClick={addLocation} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.target_locations.map((location) => (
              <Badge key={location} variant="secondary" className="flex items-center gap-1">
                {location}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeLocation(location)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Financial Criteria */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_revenue">Facturación Mínima (€)</Label>
            <Input
              id="min_revenue"
              type="number"
              value={formData.min_revenue || ''}
              onChange={(e) => setFormData(prev => ({...prev, min_revenue: e.target.value ? Number(e.target.value) : undefined}))}
              placeholder="1000000"
            />
          </div>
          <div>
            <Label htmlFor="max_revenue">Facturación Máxima (€)</Label>
            <Input
              id="max_revenue"
              type="number"
              value={formData.max_revenue || ''}
              onChange={(e) => setFormData(prev => ({...prev, max_revenue: e.target.value ? Number(e.target.value) : undefined}))}
              placeholder="10000000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_ebitda">EBITDA Mínimo (€)</Label>
            <Input
              id="min_ebitda"
              type="number"
              value={formData.min_ebitda || ''}
              onChange={(e) => setFormData(prev => ({...prev, min_ebitda: e.target.value ? Number(e.target.value) : undefined}))}
              placeholder="100000"
            />
          </div>
          <div>
            <Label htmlFor="max_ebitda">EBITDA Máximo (€)</Label>
            <Input
              id="max_ebitda"
              type="number"
              value={formData.max_ebitda || ''}
              onChange={(e) => setFormData(prev => ({...prev, max_ebitda: e.target.value ? Number(e.target.value) : undefined}))}
              placeholder="1000000"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="other_criteria">Otros Criterios</Label>
          <Textarea
            id="other_criteria"
            value={formData.other_criteria}
            onChange={(e) => setFormData(prev => ({...prev, other_criteria: e.target.value}))}
            placeholder="Describe cualquier otro criterio específico para la búsqueda..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !canSave}>
          {isSubmitting ? 'Creando...' : 'Crear Mandato'}
        </Button>
      </div>
    </form>
  );
};

export const CreateMandateDialog = ({ 
  trigger, 
  onSuccess, 
  initialData, 
  leadId, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange 
}: CreateMandateDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Mandato
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Mandato de Compra</DialogTitle>
          <DialogDescription>
            Registra un nuevo mandato de búsqueda de empresas para adquisición
          </DialogDescription>
        </DialogHeader>

        <FormValidationProvider>
          <CreateMandateForm 
            onSuccess={() => { setOpen(false); onSuccess?.(); }} 
            initialData={initialData}
            leadId={leadId}
          />
        </FormValidationProvider>
      </DialogContent>
    </Dialog>
  );
};