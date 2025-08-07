
import { Contact } from '@/types/Contact';
import { ContactSummarySection } from './ContactSummarySection';
import { ContactDetailsSection } from './ContactDetailsSection';
import { ContactOrganizationSection } from './ContactOrganizationSection';
import { ContactActivitySection } from './ContactActivitySection';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface ContactLeftSidebarProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
}

export const ContactLeftSidebar = ({ contact, onEdit }: ContactLeftSidebarProps) => {
  return (
    <div className="w-80 bg-background border-r border-border overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Información del Contacto</h2>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(contact)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        {/* Simplified Sections - No collapsibles */}
        <ContactSummarySection contact={contact} />
        <ContactDetailsSection contact={contact} onEdit={undefined} />
        <ContactOrganizationSection contact={contact} />
        <ContactActivitySection contact={contact} />
      </div>
    </div>
  );
};
