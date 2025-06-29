
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { useContacts } from "@/hooks/useContacts";
import { CreateContactData } from "@/types/Contact";

export default function Contacts() {
  const {
    contacts,
    isLoading,
    createContact,
    updateContact,
    deleteContact,
    isCreating,
    isUpdating,
    isDeleting
  } = useContacts();

  const handleCreateContact = (contactData: CreateContactData) => {
    createContact(contactData);
  };

  const handleEditContact = (contact: any) => {
    // TODO: Implement edit functionality
    console.log('Edit contact:', contact);
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      deleteContact(contactId);
    }
  };

  return (
    <ContactsTable 
      contacts={contacts}
      onCreateContact={handleCreateContact}
      onEditContact={handleEditContact}
      onDeleteContact={handleDeleteContact}
      isLoading={isLoading}
      isCreating={isCreating}
    />
  );
}
