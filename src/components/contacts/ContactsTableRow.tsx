
import { TableCell, TableRow } from "@/components/ui/table";
import { Contact } from "@/types/Contact";
import { ContactRowInfo } from "./ContactRowInfo";
import { ContactBadges } from "./ContactBadges";
import { ContactActions } from "./ContactActions";

interface ContactsTableRowProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
}

export const ContactsTableRow = ({ contact, onEdit, onDelete }: ContactsTableRowProps) => {
  const { typeBadge, priorityBadge } = ContactBadges({ 
    type: contact.contact_type, 
    priority: contact.contact_priority 
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <TableRow key={contact.id} className="hover:bg-gray-50">
      <TableCell>
        <ContactRowInfo 
          name={contact.name}
          email={contact.email}
          phone={contact.phone}
        />
      </TableCell>
      
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{contact.company || 'N/A'}</div>
          <div className="text-sm text-gray-500">{contact.position || 'N/A'}</div>
        </div>
      </TableCell>
      
      <TableCell>
        {typeBadge}
      </TableCell>
      
      <TableCell>
        {priorityBadge}
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-gray-600">
          {contact.contact_source || 'N/A'}
        </span>
      </TableCell>
      
      <TableCell>
        <div className="text-sm text-gray-900">
          {formatDate(contact.created_at)}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <ContactActions 
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};
