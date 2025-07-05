import React, { useEffect, useState } from "react";
import { PersonRecordTable } from "@/components/contacts/PersonRecordTable";
import { PersonModal } from "@/components/contacts/PersonModal";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { useContactsCRUD } from "@/hooks/useContactsCRUD";
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";
import { Button } from "@/components/ui/button";

export default function Contacts() {
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // Keyboard shortcut for new person
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          const activeElement = document.activeElement;
          if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
            e.preventDefault();
            setIsCreateModalOpen(true);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
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
    // Navigation is now handled by PersonRecordTable
    console.log('Viewing contact:', contact.name);
  };

  const handleSearch = (term: string) => {
    // TODO: Implement search functionality
    console.log('Searching for:', term);
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Opening filters');
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contactos</h2>
          <p className="text-muted-foreground">
            Gestiona todas las personas de tu red de contactos.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          + New person
        </Button>
      </div>

      <PersonRecordTable
        contacts={contacts || []}
        totalCount={contacts?.length || 0}
        onRowClick={handleViewContact}
        onCreateContact={() => setIsCreateModalOpen(true)}
        onSearch={handleSearch}
        onFilter={handleFilter}
        isLoading={isFetching}
      />

      {/* Create Person Modal */}
      <PersonModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateContact={handleCreateContact}
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
