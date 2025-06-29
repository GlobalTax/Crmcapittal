
import { Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateContactDialog } from "./CreateContactDialog";

interface ContactsTableHeaderProps {
  onCreateContact: (contactData: any) => void;
  isCreating?: boolean;
}

export const ContactsTableHeader = ({ 
  onCreateContact, 
  isCreating = false 
}: ContactsTableHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Contactos</h1>
        <p className="text-gray-600 mt-1">Gestiona todos tus contactos y leads</p>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" className="border-gray-300">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        <Button variant="outline" className="border-gray-300">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
        <CreateContactDialog onCreateContact={onCreateContact} isCreating={isCreating} />
      </div>
    </div>
  );
};
