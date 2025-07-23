
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Lead, UpdateLeadData, LeadStatus, LeadSource, LeadServiceType, LeadPriority, LeadQuality } from '@/types/Lead';

interface LeadEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead;
  onUpdateLead: (updates: UpdateLeadData) => void;
  isUpdating: boolean;
}

export const LeadEditDialog = ({ 
  open, 
  onOpenChange, 
  lead, 
  onUpdateLead, 
  isUpdating 
}: LeadEditDialogProps) => {
  const [formData, setFormData] = useState<UpdateLeadData>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company_name,
        position: lead.job_title,
        message: lead.message,
        source: lead.source,
        status: lead.status,
        service_type: lead.service_type,
        priority: lead.priority,
        quality: lead.quality,
        lead_score: lead.lead_score
      });
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateLead(formData);
  };

  const handleInputChange = (field: keyof UpdateLeadData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="position">Cargo</Label>
            <Input
              id="position"
              value={formData.position || ''}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="status">Estado</Label>
            <Select 
              value={formData.status || 'NEW'} 
              onValueChange={(value: LeadStatus) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">Nuevo</SelectItem>
                <SelectItem value="CONTACTED">Contactado</SelectItem>
                <SelectItem value="QUALIFIED">Calificado</SelectItem>
                <SelectItem value="DISQUALIFIED">Descalificado</SelectItem>
                <SelectItem value="NURTURING">Nutriendo</SelectItem>
                <SelectItem value="CONVERTED">Convertido</SelectItem>
                <SelectItem value="LOST">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="source">Fuente</Label>
            <Select 
              value={formData.source || 'other'} 
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
            <Label htmlFor="priority">Prioridad</Label>
            <Select 
              value={formData.priority || 'MEDIUM'} 
              onValueChange={(value: LeadPriority) => handleInputChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lead_score">Score</Label>
            <Input
              id="lead_score"
              type="number"
              min="0"
              max="100"
              value={formData.lead_score || 0}
              onChange={(e) => handleInputChange('lead_score', parseInt(e.target.value) || 0)}
            />
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
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Actualizando...' : 'Actualizar Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
