
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProposals } from '@/hooks/useProposals';
import { useContacts } from '@/hooks/useContacts';
import { useCompanies } from '@/hooks/useCompanies';
import { usePracticeAreas } from '@/hooks/usePracticeAreas';

import { CreateProposalData } from '@/types/Proposal';

interface CreateProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
  prefilledData?: Partial<CreateProposalData>;
}

export const CreateProposalDialog: React.FC<CreateProposalDialogProps> = ({ 
  isOpen, 
  onClose, 
  leadId, 
  prefilledData 
}) => {
  const [formData, setFormData] = useState<CreateProposalData>({
    title: '',
    description: '',
    contact_id: '',
    company_id: '',
    practice_area_id: '',
    total_amount: 0,
    currency: 'EUR',
    proposal_type: 'punctual',
    valid_until: '',
    terms_and_conditions: '',
    notes: '',
    ...prefilledData
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProposal } = useProposals();
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { practiceAreas } = usePracticeAreas();
  // const { updateLead } = useLeads(); // Leads functionality removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating proposal with data:', formData);
      
      const proposal = await createProposal({
        ...formData,
        contact_id: formData.contact_id || undefined,
        company_id: formData.company_id || undefined,
        practice_area_id: formData.practice_area_id || undefined,
        valid_until: formData.valid_until || undefined,
      });
      
      console.log('Proposal created successfully:', proposal);
      
      // Si la propuesta se creó desde un lead, actualizar el estado del lead
      if (leadId && proposal) {
        // Lead update functionality removed
        console.log('Lead update functionality removed');
      }
      
      // Limpiar formulario
      setFormData({
        title: '',
        description: '',
        contact_id: '',
        company_id: '',
        practice_area_id: '',
        total_amount: 0,
        currency: 'EUR',
        proposal_type: 'punctual',
        valid_until: '',
        terms_and_conditions: '',
        notes: ''
      });
      
      // Cerrar modal primero
      onClose();
      
      // Toast de éxito y redirección inmediata
      toast({
        title: "¡Propuesta creada exitosamente!",
        description: "Redirigiendo a la página de propuestas...",
      });
      
      console.log('Navigating to /proposals');
      // Redirección inmediata sin setTimeout
      navigate('/proposals');
      
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear la propuesta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateProposalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Propuesta de Honorarios</DialogTitle>
          <DialogDescription>
            Crea una nueva propuesta profesional para tu cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Propuesta *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ej: Propuesta de Servicios Legales - Empresa ABC"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción breve de los servicios a proporcionar"
                rows={3}
              />
            </div>
          </div>

          {/* Cliente y empresa */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contacto</Label>
                <Select value={formData.contact_id} onValueChange={(value) => handleChange('contact_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar contacto" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} {contact.email && `- ${contact.email}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={formData.company_id} onValueChange={(value) => handleChange('company_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Detalles del servicio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Detalles del Servicio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Área de Práctica</Label>
                <Select value={formData.practice_area_id} onValueChange={(value) => handleChange('practice_area_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {practiceAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Propuesta</Label>
                <Select value={formData.proposal_type} onValueChange={(value) => handleChange('proposal_type', value as 'punctual' | 'recurring')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="punctual">Puntual</SelectItem>
                    <SelectItem value="recurring">Recurrente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_amount">Importe Total</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => handleChange('total_amount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Moneda</Label>
                <Select value={formData.currency} onValueChange={(value) => handleChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Válida Hasta</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => handleChange('valid_until', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Términos y notas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Términos y Condiciones</h3>
            
            <div className="space-y-2">
              <Label htmlFor="terms_and_conditions">Términos y Condiciones</Label>
              <Textarea
                id="terms_and_conditions"
                value={formData.terms_and_conditions}
                onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
                placeholder="Términos y condiciones específicos de esta propuesta"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas Internas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Notas internas (no visibles para el cliente)"
                rows={3}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Propuesta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
