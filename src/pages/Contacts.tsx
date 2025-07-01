
import { useState } from "react";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { ContactDetailsDialog } from "@/components/contacts/ContactDetailsDialog";
import { useContactsCRUD } from "@/hooks/useContactsCRUD";
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";

export default function Contacts() {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);

  const {
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    isCreating,
    isFetching,
    isUpdating,
    isDeleting,
    fetchedContacts: contacts,
  } = useContactsCRUD();

  // Fetch contacts on mount
  React.useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = (contactData: CreateContactData) => {
    createContact(contactData).then((result) => {
      if (result.data) {
        // Refresh the contacts list
        fetchContacts();
      }
    });
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleUpdateContact = (contactId: string, contactData: UpdateContactData) => {
    updateContact(contactId, contactData).then((result) => {
      if (result.data) {
        // Refresh the contacts list
        fetchContacts();
        setEditingContact(null);
      }
    });
  };

  const handleDeleteContact = (contactId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      deleteContact(contactId).then((result) => {
        if (result !== null) {
          // Refresh the contacts list
          fetchContacts();
        }
      });
    }
  };

  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
  };

  return (
    <div className="space-y-6">
      <ContactsTable 
        contacts={contacts || []}
        onCreateContact={handleCreateContact}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
        onViewContact={handleViewContact}
        isLoading={isFetching}
        isCreating={isCreating}
      />

      {/* Edit Contact Dialog */}
      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
          onUpdateContact={handleUpdateContact}
          isUpdating={isUpdating}
        />
      )}

      {/* Contact Details Dialog */}
      {viewingContact && (
        <ContactDetailsDialog
          contact={viewingContact}
          open={!!viewingContact}
          onOpenChange={(open) => !open && setViewingContact(null)}
          onEditContact={(contact) => {
            setViewingContact(null);
            setEditingContact(contact);
          }}
        />
      )}
    </div>
  );
}
