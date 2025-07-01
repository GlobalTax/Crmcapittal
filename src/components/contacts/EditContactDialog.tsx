
import { useState, useEffect } from "react";
import { Contact, UpdateContactData } from "@/types/Contact";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    first_name: contact.first_name || "",
    last_name: contact.last_name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    mobile: contact.mobile || "",
    company: contact.company || "",
    position: contact.position || "",
    job_title: contact.job_title || "",
    company_size: contact.company_size || "",
    address: contact.address || "",
    city: contact.city || "",
    country: contact.country || "España",
    contact_type: contact.contact_type,
    contact_priority: contact.contact_priority || "medium",
    contact_source: contact.contact_source || "web",
    linkedin_url: contact.linkedin_url || "",
    website_url: contact.website_url || "",
    preferred_contact_method: contact.preferred_contact_method || "email",
    sectors_of_interest: contact.sectors_of_interest || [],
    notes: contact.notes || "",
    lead_score: contact.lead_score || 0,
    next_follow_up_date: contact.next_follow_up_date || "",
  });

  useEffect(() => {
    if (contact) {
      setContactData({
        name: contact.name || "",
        first_name: contact.first_name || "",
        last_name: contact.last_name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        mobile: contact.mobile || "",
        company: contact.company || "",
        position: contact.position || "",
        job_title: contact.job_title || "",
        company_size: contact.company_size || "",
        address: contact.address || "",
        city: contact.city || "",
        country: contact.country || "España",
        contact_type: contact.contact_type,
        contact_priority: contact.contact_priority || "medium",
        contact_source: contact.contact_source || "web",
        linkedin_url: contact.linkedin_url || "",
        website_url: contact.website_url || "",
        preferred_contact_method: contact.preferred_contact_method || "email",
        sectors_of_interest: contact.sectors_of_interest || [],
        notes: contact.notes || "",
        lead_score: contact.lead_score || 0,
        next_follow_up_date: contact.next_follow_up_date || "",
      });
    }
  }, [contact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create the full name from first_name and last_name if they exist
    const fullName = `${contactData.first_name} ${contactData.last_name}`.trim();
    
    const updateData: UpdateContactData = {
      id: contact.id,
      ...contactData,
      name: fullName || contactData.first_name || contactData.name || "Sin nombre",
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-orange-600" />
            Editar Contacto
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <PersonalInfo contactData={contactData} updateField={updateField} />
          <ProfessionalInfo contactData={contactData} updateField={updateField} />
          <ContactClassification contactData={contactData} updateField={updateField} />
          <AdditionalContactInfo contactData={contactData} updateField={updateField} />

          <div className="flex justify-end space-x-3 pt-4 border-t">
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
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
