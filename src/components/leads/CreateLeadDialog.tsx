
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
import { CreateLeadData, LeadSource, LeadOrigin } from "@/types/Lead";
import { CreateContactData } from "@/types/Contact";

interface CreateLeadDialogProps {
  onCreateLead: (data: CreateContactData) => void;
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

export const CreateLeadDialog = ({ onCreateLead, isCreating, isOpen, onClose }: CreateLeadDialogProps) => {
  const [open, setOpen] = useState(false);
  
  // Use external state if provided
  const dialogOpen = isOpen !== undefined ? isOpen : open;
  const setDialogOpen = onClose !== undefined ? (open: boolean) => !open && onClose() : setOpen;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    source: 'other'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create contact data for lead
    const contactData: CreateContactData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      notes: formData.message,
      contact_type: 'lead',
      lifecycle_stage: 'customer',
      lead_source: formData.source,
      lead_origin: 'manual',
      lead_score: 0,
    };
    
    onCreateLead(contactData);
    setDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      source: 'other'
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Lead</DialogTitle>
          <DialogDescription>
            Ingresa la información del nuevo lead.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Compañía</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Fuente *</Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
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
            <div className="grid gap-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
