
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateLeadData, LeadSource, LeadOrigin, LeadServiceType } from "@/types/Lead";
import { CreateContactData, Contact } from "@/types/Contact";
import { ContactSelector } from "./ContactSelector";

interface CreateLeadDialogProps {
  onCreateLead: (data: CreateContactData & { opportunity_name: string; estimated_value?: number; close_date?: string; probability?: number; service_type: LeadServiceType }) => void;
  isCreating?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const leadSources = [
  { value: 'website_form', label: 'Sitio Web' },
  { value: 'referral', label: 'Referencia' },
  { value: 'email_campaign', label: 'Email Marketing' },
  { value: 'social_media', label: 'Redes Sociales' },
  { value: 'event', label: 'Evento' },
  { value: 'other', label: 'Otro' }
] as const;

const serviceTypes = [
  { value: 'mandato_venta', label: 'Mandato de Venta', description: 'Venta de empresas' },
  { value: 'mandato_compra', label: 'Mandato de Compra', description: 'Búsqueda de empresas para adquirir' },
  { value: 'valoracion_empresa', label: 'Valoración de Empresa', description: 'Servicios de valoración empresarial' }
] as const;

export const CreateLeadDialog = ({ onCreateLead, isCreating, isOpen, onClose }: CreateLeadDialogProps) => {
  const [open, setOpen] = useState(false);
  
  // Use external state if provided
  const dialogOpen = isOpen !== undefined ? isOpen : open;
  const setDialogOpen = onClose !== undefined ? (open: boolean) => !open && onClose() : setOpen;
  
  // Lead opportunity data
  const [opportunityData, setOpportunityData] = useState({
    opportunity_name: '',
    service_type: 'mandato_venta' as LeadServiceType,
    estimated_value: '',
    close_date: '',
    probability: '50',
    source: 'other',
    message: ''
  });

  // Contact data
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContactData, setNewContactData] = useState<Partial<Contact> | null>(null);

  // Generate lead name automatically based on opportunity name
  const generateLeadName = (opportunityName: string) => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${opportunityName} - ${dateStr}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!opportunityData.opportunity_name) return;
    
    // Determine contact data (existing or new)
    let contactData: CreateContactData;
    
    if (selectedContact) {
      // Use existing contact
      contactData = {
        name: generateLeadName(opportunityData.opportunity_name),
        email: selectedContact.email,
        phone: selectedContact.phone,
        company: selectedContact.company,
        position: selectedContact.position,
        company_id: selectedContact.company_id,
        contact_type: 'lead',
        lifecycle_stage: 'marketing_qualified_lead',
        lead_source: opportunityData.source,
        lead_origin: 'manual',
        lead_score: 0,
        notes: opportunityData.message,
      };
    } else if (newContactData) {
      // Use new contact data
      contactData = {
        name: generateLeadName(opportunityData.opportunity_name),
        email: newContactData.email,
        phone: newContactData.phone,
        company: newContactData.company,
        position: newContactData.position,
        contact_type: 'lead',
        lifecycle_stage: 'marketing_qualified_lead',
        lead_source: opportunityData.source,
        lead_origin: 'manual',
        lead_score: 0,
        notes: opportunityData.message,
      };
    } else {
      return; // No contact selected or created
    }
    
    // Add opportunity-specific data
    const leadData = {
      ...contactData,
      opportunity_name: opportunityData.opportunity_name,
      service_type: opportunityData.service_type,
      estimated_value: opportunityData.estimated_value ? parseFloat(opportunityData.estimated_value) : undefined,
      close_date: opportunityData.close_date || undefined,
      probability: parseInt(opportunityData.probability)
    };
    
    onCreateLead(leadData);
    
    // Reset form
    setDialogOpen(false);
    setOpportunityData({
      opportunity_name: '',
      service_type: 'mandato_venta',
      estimated_value: '',
      close_date: '',
      probability: '50',
      source: 'other',
      message: ''
    });
    setSelectedContact(null);
    setNewContactData(null);
  };

  const handleOpportunityChange = (field: string, value: string) => {
    setOpportunityData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    setNewContactData(null);
  };

  const handleCreateNewContact = (contactData: Partial<Contact>) => {
    setNewContactData(contactData);
    setSelectedContact(null);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isOpen && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Lead
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
          <DialogDescription>
            Define la oportunidad de negocio y asigna o crea un contacto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* Opportunity Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Información de la Oportunidad</h4>
              
              <div className="grid gap-2">
                <Label htmlFor="opportunity_name">Nombre de la Oportunidad *</Label>
                <Input
                  id="opportunity_name"
                  value={opportunityData.opportunity_name}
                  onChange={(e) => handleOpportunityChange('opportunity_name', e.target.value)}
                  placeholder="ej: Consultoría RRHH - Empresa ABC"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service_type">Tipo de Servicio *</Label>
                <Select 
                  value={opportunityData.service_type} 
                  onValueChange={(value: LeadServiceType) => handleOpportunityChange('service_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo de servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{service.label}</span>
                          <span className="text-xs text-muted-foreground">{service.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="estimated_value">Valor Estimado (€)</Label>
                  <Input
                    id="estimated_value"
                    type="number"
                    value={opportunityData.estimated_value}
                    onChange={(e) => handleOpportunityChange('estimated_value', e.target.value)}
                    placeholder="50000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="probability">Probabilidad (%)</Label>
                  <Select 
                    value={opportunityData.probability} 
                    onValueChange={(value) => handleOpportunityChange('probability', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="25">25%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="close_date">Fecha de Cierre</Label>
                  <Input
                    id="close_date"
                    type="date"
                    value={opportunityData.close_date}
                    onChange={(e) => handleOpportunityChange('close_date', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Fuente *</Label>
                  <Select value={opportunityData.source} onValueChange={(value) => handleOpportunityChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      {leadSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="message">Notas</Label>
                <Textarea
                  id="message"
                  value={opportunityData.message}
                  onChange={(e) => handleOpportunityChange('message', e.target.value)}
                  rows={2}
                  placeholder="Información adicional sobre la oportunidad..."
                />
              </div>
            </div>

            {/* Contact Selection */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Contacto Asociado</h4>
              <ContactSelector
                selectedContactId={selectedContact?.id}
                onContactSelect={handleContactSelect}
                onCreateNew={handleCreateNewContact}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || !opportunityData.opportunity_name || (!selectedContact && !newContactData)}
            >
              {isCreating ? 'Creando...' : 'Crear Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
