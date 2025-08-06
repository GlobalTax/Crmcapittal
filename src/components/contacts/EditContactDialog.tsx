import { useState, useEffect } from "react";
import { Contact, UpdateContactData } from "@/types/Contact";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { PersonalInfo } from "./forms/PersonalInfo";
import { ProfessionalInfo } from "./forms/ProfessionalInfo";
import { ContactClassification } from "./forms/ContactClassification";
import { AdditionalContactInfo } from "./forms/AdditionalContactInfo";

interface EditContactDialogProps {
  contact: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateContact: (id: string, data: UpdateContactData) => void;
  isUpdating?: boolean;
}

export const EditContactDialog = ({ 
  contact, 
  open, 
  onOpenChange, 
  onUpdateContact, 
  isUpdating = false 
}: EditContactDialogProps) => {
  const [contactData, setContactData] = useState({
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    company: contact.company || "",
    position: contact.position || "",
    contact_type: contact.contact_type,
    contact_priority: contact.contact_priority || "medium",
    contact_source: contact.contact_source || "website_form",
    linkedin_url: contact.linkedin_url || "",
    website_url: contact.website_url || "",
    preferred_contact_method: contact.preferred_contact_method || "email",
    sectors_of_interest: contact.sectors_of_interest || [],
    investment_capacity_min: contact.investment_capacity_min || undefined,
    investment_capacity_max: contact.investment_capacity_max || undefined,
    deal_preferences: contact.deal_preferences || null,
    notes: contact.notes || "",
    time_zone: contact.time_zone || "",
    language_preference: contact.language_preference || "es",
  });

  useEffect(() => {
    if (contact) {
      setContactData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        position: contact.position || "",
        contact_type: contact.contact_type,
        contact_priority: contact.contact_priority || "medium",
        contact_source: contact.contact_source || "website_form",
        linkedin_url: contact.linkedin_url || "",
        website_url: contact.website_url || "",
        preferred_contact_method: contact.preferred_contact_method || "email",
        sectors_of_interest: contact.sectors_of_interest || [],
        investment_capacity_min: contact.investment_capacity_min || undefined,
        investment_capacity_max: contact.investment_capacity_max || undefined,
        deal_preferences: contact.deal_preferences || null,
        notes: contact.notes || "",
        time_zone: contact.time_zone || "",
        language_preference: contact.language_preference || "es",
      });
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: UpdateContactData = {
      id: contact.id,
      ...contactData,
      name: contactData.name || "Sin nombre",
    };
    
    onUpdateContact(contact.id, updateData);
    if (!isUpdating) {
      onOpenChange(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Editar Contacto
          </DialogTitle>
          <DialogDescription>
            Actualiza la información del contacto
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <PersonalInfo contactData={contactData} updateField={updateField} />
          <ProfessionalInfo contactData={contactData} updateField={updateField} />
          <ContactClassification contactData={contactData} updateField={updateField} />
          <AdditionalContactInfo contactData={contactData} updateField={updateField} />

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};