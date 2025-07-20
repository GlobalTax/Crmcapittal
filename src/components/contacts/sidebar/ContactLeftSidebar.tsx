
import { Contact } from '@/types/Contact';
import { ContactSummarySection } from './ContactSummarySection';
import { ContactDetailsSection } from './ContactDetailsSection';
import { ContactOrganizationSection } from './ContactOrganizationSection';
import { ContactDealsSection } from './ContactDealsSection';
import { ContactActivitySection } from './ContactActivitySection';

interface ContactLeftSidebarProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
}

export const ContactLeftSidebar = ({ contact, onEdit }: ContactLeftSidebarProps) => {
  return (
    <div className="w-80 bg-background border-r border-border overflow-y-auto">
      <div className="p-4 space-y-4">
        <ContactSummarySection contact={contact} />
        <ContactDetailsSection contact={contact} onEdit={onEdit} />
        <ContactOrganizationSection contact={contact} />
        <ContactDealsSection contact={contact} />
        <ContactActivitySection contact={contact} />
      </div>
    </div>
  );
};
