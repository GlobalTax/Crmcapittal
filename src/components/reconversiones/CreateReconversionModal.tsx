import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, X, Plus } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { useReconversiones } from '@/hooks/useReconversiones';
import { toast } from 'sonner';

interface CreateReconversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rejectedTarget?: MandateTarget;
  mandateId?: string;
}

const DEAL_STRUCTURES = [
  { value: 'adquisicion', label: 'Adquisición' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'fusion', label: 'Fusión' }
];

const TIMELINE_OPTIONS = [
  { value: 'inmediato', label: 'Inmediato (0-3 meses)' },
  { value: 'corto', label: 'Corto plazo (3-6 meses)' },
  { value: 'medio', label: 'Medio plazo (6-12 meses)' },
  { value: 'largo', label: 'Largo plazo (12+ meses)' }
];

const COMMON_SECTORS = [
  'Tecnología', 'Servicios Financieros', 'Salud', 'Educación', 'Retail',
  'Manufactura', 'Logística', 'Inmobiliario', 'Energía', 'Telecomunicaciones'
];

const COMMON_LOCATIONS = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Zaragoza',
  'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Alicante', 'Córdoba'
];

export const CreateReconversionModal = ({ 
  open, 
  onOpenChange, 
  rejectedTarget,
  mandateId 
}: CreateReconversionModalProps) => {
  const { createReconversion } = useReconversiones();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos del comprador (pre-rellenados)
    buyer_company_name: rejectedTarget?.company_name || '',
    buyer_contact_info: rejectedTarget ? {
      name: rejectedTarget.contact_name,
      email: rejectedTarget.contact_email,
      phone: rejectedTarget.contact_phone
    } : {},
    
    // Información del mandato original
    original_mandate_id: mandateId || '',
    original_rejection_reason: '',
    
    // Campos requeridos para perfilar el comprador
    target_sectors: [] as string[],
    target_locations: [] as string[],
    revenue_range_min: '',
    revenue_range_max: '',
    ebitda_range_min: '',
    ebitda_range_max: '',
    investment_capacity_min: '',
    investment_capacity_max: '',
    deal_structure_preferences: [] as string[],
    timeline_horizon: '',
    notes: '',
    
    // Campos adicionales
    nombre_reconversion: '',
    sector_objetivo: '',
    descripcion: ''
  });

  const [customSector, setCustomSector] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre_reconversion.trim()) {
      toast.error('El nombre de la reconversión es obligatorio');
      return;
    }
    
    if (formData.target_sectors.length === 0) {
      toast.error('Debe seleccionar al menos un sector objetivo');
      return;
    }
    
    if (formData.target_locations.length === 0) {
      toast.error('Debe seleccionar al menos una localización');
      return;
    }
    
    if (!formData.revenue_range_min || !formData.revenue_range_max) {
      toast.error('El rango de ingresos es obligatorio');
      return;
    }
    
    if (!formData.ebitda_range_min || !formData.ebitda_range_max) {
      toast.error('El rango de EBITDA es obligatorio');
      return;
    }
    
    if (!formData.investment_capacity_min || !formData.investment_capacity_max) {
      toast.error('La capacidad de inversión es obligatoria');
      return;
    }
    
    if (formData.deal_structure_preferences.length === 0) {
      toast.error('Debe seleccionar al menos una preferencia de estructura');
      return;
    }
    
    if (!formData.timeline_horizon) {
      toast.error('El horizonte temporal es obligatorio');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const reconversionData = {
        contact_name: formData.buyer_company_name,
        rejection_reason: formData.original_rejection_reason || 'Rechazado en mandato anterior',
        buyer_company_name: formData.buyer_company_name,
        buyer_contact_info: formData.buyer_contact_info,
        original_mandate_id: formData.original_mandate_id || null,
        original_rejection_reason: formData.original_rejection_reason,
        target_sectors: formData.target_sectors,
        target_locations: formData.target_locations,
        revenue_range_min: parseFloat(formData.revenue_range_min),
        revenue_range_max: parseFloat(formData.revenue_range_max),
        ebitda_range_min: parseFloat(formData.ebitda_range_min),
        ebitda_range_max: parseFloat(formData.ebitda_range_max),
        investment_capacity_min: parseFloat(formData.investment_capacity_min),
        investment_capacity_max: parseFloat(formData.investment_capacity_max),
        deal_structure_preferences: formData.deal_structure_preferences,
        timeline_horizon: formData.timeline_horizon,
        notes: formData.notes,
        // Campos adicionales requeridos por la tabla
        company_name: formData.buyer_company_name,
        sector_objetivo: formData.target_sectors.join(', '),
        descripcion: formData.descripcion || `Reconversión para ${formData.buyer_company_name}`,
        contact_email: (formData.buyer_contact_info as any)?.email || null,
        contact_phone: (formData.buyer_contact_info as any)?.phone || null,
        conversion_probability: 30 // Valor por defecto
      };

      await createReconversion(reconversionData);
      toast.success('Reconversión creada exitosamente');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        buyer_company_name: '',
        buyer_contact_info: {},
        original_mandate_id: '',
        original_rejection_reason: '',
        target_sectors: [],
        target_locations: [],
        revenue_range_min: '',
        revenue_range_max: '',
        ebitda_range_min: '',
        ebitda_range_max: '',
        investment_capacity_min: '',
        investment_capacity_max: '',
        deal_structure_preferences: [],
        timeline_horizon: '',
        notes: '',
        nombre_reconversion: '',
        sector_objetivo: '',
        descripcion: ''
      });
      
    } catch (error) {
      console.error('Error creating reconversion:', error);
      toast.error('Error al crear la reconversión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCustomSector = () => {
    if (customSector.trim() && !formData.target_sectors.includes(customSector.trim())) {
      setFormData(prev => ({
        ...prev,
        target_sectors: [...prev.target_sectors, customSector.trim()]
      }));
      setCustomSector('');
    }
  };

  const addCustomLocation = () => {
    if (customLocation.trim() && !formData.target_locations.includes(customLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        target_locations: [...prev.target_locations, customLocation.trim()]
      }));
      setCustomLocation('');
    }
  };

  const removeSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      target_sectors: prev.target_sectors.filter(s => s !== sector)
    }));
  };

  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      target_locations: prev.target_locations.filter(l => l !== location)
    }));
  };

  const toggleDealStructure = (structure: string) => {
    setFormData(prev => ({
      ...prev,
      deal_structure_preferences: prev.deal_structure_preferences.includes(structure)
        ? prev.deal_structure_preferences.filter(s => s !== structure)
        : [...prev.deal_structure_preferences, structure]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Crear Reconversión con Comprador Rechazado
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Comprador Pre-rellenada */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Información del Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Empresa Compradora</Label>
                  <Input 
                    value={formData.buyer_company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, buyer_company_name: e.target.value }))}
                    placeholder="Nombre de la empresa compradora"
                    required
                  />
                </div>
                <div>
                  <Label>Motivo de Rechazo</Label>
                  <Input 
                    value={formData.original_rejection_reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_rejection_reason: e.target.value }))}
                    placeholder="Razón por la cual se rechazó"
                  />
                </div>
              </div>
              
              {rejectedTarget && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <Label className="text-sm text-muted-foreground">Contacto</Label>
                    <p className="text-sm">{rejectedTarget.contact_name || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="text-sm">{rejectedTarget.contact_email || 'No disponible'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Teléfono</Label>
                    <p className="text-sm">{rejectedTarget.contact_phone || 'No disponible'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datos de la Reconversión */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos de la Reconversión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nombre de la Reconversión *</Label>
                <Input 
                  value={formData.nombre_reconversion}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre_reconversion: e.target.value }))}
                  placeholder="Ej: Reconversión Tecnología - Madrid"
                  required
                />
              </div>
              
              <div>
                <Label>Descripción</Label>
                <Textarea 
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción opcional de la reconversión"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Perfilado del Comprador */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Perfilado del Comprador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sectores Objetivo */}
              <div>
                <Label>Sectores Objetivo *</Label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    value={customSector}
                    onChange={(e) => setCustomSector(e.target.value)}
                    placeholder="Agregar sector personalizado"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSector())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomSector}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_SECTORS.map(sector => (
                    <Badge 
                      key={sector}
                      variant={formData.target_sectors.includes(sector) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.target_sectors.includes(sector)) {
                          removeSector(sector);
                        } else {
                          setFormData(prev => ({ ...prev, target_sectors: [...prev.target_sectors, sector] }));
                        }
                      }}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.target_sectors.map(sector => (
                    <Badge key={sector} variant="secondary" className="gap-1">
                      {sector}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSector(sector)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Localizaciones */}
              <div>
                <Label>Localizaciones Objetivo *</Label>
                <div className="flex gap-2 mb-2">
                  <Input 
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Agregar localización personalizada"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLocation())}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addCustomLocation}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COMMON_LOCATIONS.map(location => (
                    <Badge 
                      key={location}
                      variant={formData.target_locations.includes(location) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.target_locations.includes(location)) {
                          removeLocation(location);
                        } else {
                          setFormData(prev => ({ ...prev, target_locations: [...prev.target_locations, location] }));
                        }
                      }}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.target_locations.map(location => (
                    <Badge key={location} variant="secondary" className="gap-1">
                      {location}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeLocation(location)} />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Rangos Financieros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Rango de Ingresos (EUR) *</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input 
                      type="number"
                      value={formData.revenue_range_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, revenue_range_min: e.target.value }))}
                      placeholder="Mínimo"
                      required
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      type="number"
                      value={formData.revenue_range_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, revenue_range_max: e.target.value }))}
                      placeholder="Máximo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Rango de EBITDA (EUR) *</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input 
                      type="number"
                      value={formData.ebitda_range_min}
                      onChange={(e) => setFormData(prev => ({ ...prev, ebitda_range_min: e.target.value }))}
                      placeholder="Mínimo"
                      required
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      type="number"
                      value={formData.ebitda_range_max}
                      onChange={(e) => setFormData(prev => ({ ...prev, ebitda_range_max: e.target.value }))}
                      placeholder="Máximo"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Capacidad de Inversión (EUR) *</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input 
                    type="number"
                    value={formData.investment_capacity_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, investment_capacity_min: e.target.value }))}
                    placeholder="Mínimo"
                    required
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input 
                    type="number"
                    value={formData.investment_capacity_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, investment_capacity_max: e.target.value }))}
                    placeholder="Máximo"
                    required
                  />
                </div>
              </div>

              {/* Preferencias de Estructura */}
              <div>
                <Label>Preferencias de Estructura *</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {DEAL_STRUCTURES.map(structure => (
                    <div key={structure.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={structure.value}
                        checked={formData.deal_structure_preferences.includes(structure.value)}
                        onCheckedChange={() => toggleDealStructure(structure.value)}
                      />
                      <Label htmlFor={structure.value} className="text-sm">
                        {structure.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horizonte Temporal */}
              <div>
                <Label>Horizonte Temporal *</Label>
                <Select 
                  value={formData.timeline_horizon} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timeline_horizon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar horizonte temporal" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMELINE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div>
                <Label>Notas Adicionales</Label>
                <Textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Información adicional sobre el perfil del comprador"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Reconversión'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};