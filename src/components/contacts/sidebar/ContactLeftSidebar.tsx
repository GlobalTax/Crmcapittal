
import { Contact } from '@/types/Contact';
import { ContactSummarySection } from './ContactSummarySection';
import { ContactDetailsSection } from './ContactDetailsSection';
import { ContactOrganizationSection } from './ContactOrganizationSection';
import { ContactActivitySection } from './ContactActivitySection';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { ContactCompleteness } from '../ContactCompleteness';
import { ContactTagEditor } from '../ContactTagEditor';
import { toast } from 'sonner';

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

        {/* Completeness + Asociar por dominio */}
        <ContactCompleteness
          contact={contact}
          onUpdate={() => {
            if (onEdit) onEdit(contact); else toast.info('Edición no disponible');
          }}
          onAssociateByDomain={() => {
            toast.success('Asociando por dominio por email/dominio…');
          }}
        />

        {/* Secciones simplificadas */}
        <ContactSummarySection contact={contact} />
        <ContactDetailsSection contact={contact} onEdit={undefined} />
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tags</h3>
          <ContactTagEditor
            tags={contact.tags || []}
            onTagsChange={() => {
              if (onEdit) onEdit(contact); else toast.info('Edición no disponible');
            }}
          />
        </div>
        <ContactOrganizationSection contact={contact} />
        <ContactActivitySection contact={contact} />
      </div>
    </div>
  );
};
