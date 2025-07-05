
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { CreateContactData } from "@/types/Contact";
import { PersonalInfo } from "./forms/PersonalInfo";
import { ProfessionalInfo } from "./forms/ProfessionalInfo";
import { ContactClassification } from "./forms/ContactClassification";
import { AdditionalContactInfo } from "./forms/AdditionalContactInfo";

interface CreateContactDialogProps {
  onCreateContact: (contactData: CreateContactData) => void;
  isCreating?: boolean;
}

export const CreateContactDialog = ({ onCreateContact, isCreating = false }: CreateContactDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    contact_type: "other" as const,
    contact_priority: "medium" as const,
    contact_source: "website_form",
    linkedin_url: "",
    website_url: "",
    preferred_contact_method: "email",
    sectors_of_interest: [] as string[],
    investment_capacity_min: undefined as number | undefined,
    investment_capacity_max: undefined as number | undefined,
    deal_preferences: null,
    notes: "",
    time_zone: "",
    language_preference: "es",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newContact: CreateContactData = {
      ...contactData,
      name: contactData.name || "Sin nombre",
    };
    
    onCreateContact(newContact);
    setOpen(false);
    
    // Reset form
    const initialState = {
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      contact_type: "other" as const,
      contact_priority: "medium" as const,
      contact_source: "website_form",
      linkedin_url: "",
      website_url: "",
      preferred_contact_method: "email",
      sectors_of_interest: [] as string[],
      investment_capacity_min: undefined as number | undefined,
      investment_capacity_max: undefined as number | undefined,
      deal_preferences: null,
      notes: "",
      time_zone: "",
      language_preference: "es",
    };
    setContactData(initialState);
  };

  const updateField = (field: string, value: any) => {
    setContactData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Crear Contacto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-orange-600" />
            Crear Nuevo Contacto
          </DialogTitle>
          <DialogDescription>
            Completa la información para agregar un nuevo contacto al sistema.
          </DialogDescription>
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
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isCreating}
            >
              {isCreating ? "Creando..." : "Crear Contacto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
