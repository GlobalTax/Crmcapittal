
import React, { useEffect, useState } from "react";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { ContactDetailView } from "@/components/contacts/ContactDetailView";
import { useContactsCRUD } from "@/hooks/useContactsCRUD";
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";

export default function Contacts() {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [showDetailView, setShowDetailView] = useState(false);

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
  useEffect(() => {
    fetchContacts();
  }, []);

  const handleCreateContact = (contactData: CreateContactData) => {
    createContact(contactData).then((result) => {
      if (result) {
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
      if (result) {
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
    setShowDetailView(true);
  };

  const handleBackFromDetail = () => {
    setShowDetailView(false);
    setViewingContact(null);
  };

  if (showDetailView && viewingContact) {
    return (
      <ContactDetailView
        contact={viewingContact}
        onBack={handleBackFromDetail}
        onEdit={(contact) => {
          setShowDetailView(false);
          setEditingContact(contact);
        }}
        onDelete={(contactId) => {
          handleDeleteContact(contactId);
          setShowDetailView(false);
          setViewingContact(null);
        }}
      />
    );
  }

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
    </div>
  );
}
