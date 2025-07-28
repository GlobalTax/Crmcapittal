
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SecureInput } from '@/components/security/SecureInput';
import { useSecureInput } from '@/hooks/useSecureInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateLeadData, LeadSource, LeadServiceType, LeadPriority, LeadQuality } from '@/types/Lead';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateLead: (data: CreateLeadData) => void;
  isCreating: boolean;
}

export const CreateLeadDialog = ({ 
  open, 
  onOpenChange, 
  onCreateLead, 
  isCreating 
}: CreateLeadDialogProps) => {
  const { sanitizeInput, validateEmail } = useSecureInput();
  const [formData, setFormData] = useState<CreateLeadData>({
    name: '',
    email: '',
    source: 'other' as LeadSource,
    phone: '',
    company: '',
    position: '',
    message: '',
    service_type: 'mandato_venta',
    priority: 'MEDIUM',
    quality: 'FAIR',
    lead_score: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateLead(formData);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      source: 'other' as LeadSource,
      phone: '',
      company: '',
      position: '',
      message: '',
      service_type: 'mandato_venta',
      priority: 'MEDIUM',
      quality: 'FAIR',
      lead_score: 0
    });
  };

  const handleInputChange = (field: keyof CreateLeadData, value: string | number) => {
    // Sanitize text inputs for security
    if (typeof value === 'string') {
      value = sanitizeInput(value, { maxLength: field === 'message' ? 2000 : 500 });
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre *</Label>
            <SecureInput
              id="name"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              enableSanitization={true}
              maxLength={200}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <SecureInput
              id="email"
              type="email"
              value={formData.email}
              onChange={(value) => {
                if (value && !validateEmail(value)) {
                  // Email validation will be shown by the SecureInput component
                  return;
                }
                handleInputChange('email', value);
              }}
              enableSanitization={true}
              maxLength={320}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <SecureInput
              id="phone"
              value={formData.phone || ''}
              onChange={(value) => handleInputChange('phone', value)}
              enableSanitization={true}
              maxLength={50}
              allowedChars={/^[\d\+\s\-\(\)]+$/}
            />
          </div>

          <div>
            <Label htmlFor="company">Empresa</Label>
            <SecureInput
              id="company"
              value={formData.company || ''}
              onChange={(value) => handleInputChange('company', value)}
              enableSanitization={true}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="position">Cargo</Label>
            <SecureInput
              id="position"
              value={formData.position || ''}
              onChange={(value) => handleInputChange('position', value)}
              enableSanitization={true}
              maxLength={200}
            />
          </div>

          <div>
            <Label htmlFor="source">Fuente *</Label>
            <Select 
              value={formData.source} 
              onValueChange={(value: LeadSource) => handleInputChange('source', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website_form">Formulario Web</SelectItem>
                <SelectItem value="lead_marker">Lead Marker</SelectItem>
                <SelectItem value="capittal_market">Capital Market</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="referral">Referido</SelectItem>
                <SelectItem value="email_campaign">Campaña Email</SelectItem>
                <SelectItem value="social_media">Redes Sociales</SelectItem>
                <SelectItem value="cold_outreach">Prospección</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="service_type">Tipo de Servicio</Label>
            <Select 
              value={formData.service_type || 'mandato_venta'} 
              onValueChange={(value: LeadServiceType) => handleInputChange('service_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mandato_venta">Mandato Venta</SelectItem>
                <SelectItem value="mandato_compra">Mandato Compra</SelectItem>
                <SelectItem value="valoracion_empresa">Valoración Empresa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              value={formData.message || ''}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
