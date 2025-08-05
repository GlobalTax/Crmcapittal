import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useLeads } from '@/hooks/useLeads';
import { Lead } from '@/types/Lead';
import { MandateType } from '@/types/BuyingMandate';

interface CreateLeadMandateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export const CreateLeadMandateDialog = ({ isOpen, onClose, lead }: CreateLeadMandateDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mandate_name: `Mandato para ${lead.name}`,
    client_name: lead.name || '',
    client_contact: lead.name || '',
    client_email: lead.email || '',
    client_phone: lead.phone || '',
    target_sectors: [] as string[],
    target_locations: [] as string[],
    min_revenue: '',
    max_revenue: '',
    min_ebitda: '',
    max_ebitda: '',
    other_criteria: ''
  });

  const { createMandate } = useBuyingMandates();
  const { updateLead } = useLeads();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mandate_name.trim() || !formData.client_name.trim()) {
      toast.error('El nombre del mandato y cliente son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      const mandateData = {
        ...formData,
        min_revenue: formData.min_revenue ? parseFloat(formData.min_revenue) : undefined,
        max_revenue: formData.max_revenue ? parseFloat(formData.max_revenue) : undefined,
        min_ebitda: formData.min_ebitda ? parseFloat(formData.min_ebitda) : undefined,
        max_ebitda: formData.max_ebitda ? parseFloat(formData.max_ebitda) : undefined,
        target_sectors: formData.target_sectors.length > 0 ? formData.target_sectors : [lead.sector_id || 'general'],
        target_locations: formData.target_locations.length > 0 ? formData.target_locations : ['España'],
        mandate_type: 'compra' as MandateType,
        status: 'active' as const
      };

      await createMandate(mandateData);
      
      // Actualizar el estado del lead
      await updateLead({ 
        id: lead.id, 
        updates: { 
          stage: 'ganado',
          status: 'CONVERTED'
        } 
      });

      toast.success('Mandato creado exitosamente', {
        description: `Se ha creado el mandato "${formData.mandate_name}" y el lead ha sido marcado como convertido.`
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating mandate:', error);
      toast.error('Error al crear el mandato');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSector = (sector: string) => {
    if (sector && !formData.target_sectors.includes(sector)) {
      setFormData(prev => ({
        ...prev,
        target_sectors: [...prev.target_sectors, sector]
      }));
    }
  };

  const removeSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      target_sectors: prev.target_sectors.filter(s => s !== sector)
    }));
  };

  const addLocation = (location: string) => {
    if (location && !formData.target_locations.includes(location)) {
      setFormData(prev => ({
        ...prev,
        target_locations: [...prev.target_locations, location]
      }));
    }
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      target_locations: prev.target_locations.filter(l => l !== location)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Mandato desde Lead</DialogTitle>
          <DialogDescription>
            Crear un mandato de búsqueda basado en la información del lead {lead.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica del mandato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información del Mandato</h3>
            
            <div className="space-y-2">
              <Label htmlFor="mandate_name">Nombre del Mandato *</Label>
              <Input
                id="mandate_name"
                value={formData.mandate_name}
                onChange={(e) => handleChange('mandate_name', e.target.value)}
                placeholder="Ej: Búsqueda de empresa tecnológica"
                required
              />
            </div>
          </div>

          {/* Información del cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Datos del Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Nombre del Cliente *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_contact">Persona de Contacto</Label>
                <Input
                  id="client_contact"
                  value={formData.client_contact}
                  onChange={(e) => handleChange('client_contact', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleChange('client_email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">Teléfono</Label>
                <Input
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => handleChange('client_phone', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Criterios de búsqueda */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Criterios de Búsqueda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sectores Objetivo</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.target_sectors.map((sector) => (
                    <span
                      key={sector}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeSector(sector)}
                    >
                      {sector} ×
                    </span>
                  ))}
                </div>
                <Select onValueChange={addSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Añadir sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tecnologia">Tecnología</SelectItem>
                    <SelectItem value="salud">Salud</SelectItem>
                    <SelectItem value="educacion">Educación</SelectItem>
                    <SelectItem value="finanzas">Finanzas</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufactura">Manufactura</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ubicaciones</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.target_locations.map((location) => (
                    <span
                      key={location}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm cursor-pointer"
                      onClick={() => removeLocation(location)}
                    >
                      {location} ×
                    </span>
                  ))}
                </div>
                <Select onValueChange={addLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Añadir ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="España">España</SelectItem>
                    <SelectItem value="Madrid">Madrid</SelectItem>
                    <SelectItem value="Barcelona">Barcelona</SelectItem>
                    <SelectItem value="Valencia">Valencia</SelectItem>
                    <SelectItem value="Sevilla">Sevilla</SelectItem>
                    <SelectItem value="Europa">Europa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facturación Mínima (€)</Label>
                <Input
                  type="number"
                  value={formData.min_revenue}
                  onChange={(e) => handleChange('min_revenue', e.target.value)}
                  placeholder="Ej: 1000000"
                />
              </div>

              <div className="space-y-2">
                <Label>Facturación Máxima (€)</Label>
                <Input
                  type="number"
                  value={formData.max_revenue}
                  onChange={(e) => handleChange('max_revenue', e.target.value)}
                  placeholder="Ej: 10000000"
                />
              </div>

              <div className="space-y-2">
                <Label>EBITDA Mínimo (€)</Label>
                <Input
                  type="number"
                  value={formData.min_ebitda}
                  onChange={(e) => handleChange('min_ebitda', e.target.value)}
                  placeholder="Ej: 100000"
                />
              </div>

              <div className="space-y-2">
                <Label>EBITDA Máximo (€)</Label>
                <Input
                  type="number"
                  value={formData.max_ebitda}
                  onChange={(e) => handleChange('max_ebitda', e.target.value)}
                  placeholder="Ej: 1000000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="other_criteria">Otros Criterios</Label>
              <Textarea
                id="other_criteria"
                value={formData.other_criteria}
                onChange={(e) => handleChange('other_criteria', e.target.value)}
                placeholder="Otros criterios específicos de búsqueda"
                rows={3}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Mandato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};