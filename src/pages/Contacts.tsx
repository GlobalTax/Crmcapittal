import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PersonRecordTable } from "@/components/contacts/PersonRecordTable";
import { PersonModal } from "@/components/contacts/PersonModal";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { ContactsHeader } from "@/components/contacts/ContactsHeader";
import { ContactsGrid } from "@/components/contacts/ContactsGrid";
import { useOptimizedContacts } from '@/hooks/useOptimizedContacts';
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";
import { Button } from "@/components/ui/button";

export default function Contacts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const {
    contacts,
    createContact,
    updateContact,
    deleteContact,
    isLoading: isFetching,
    error,
    refetch: fetchContacts
  } = useOptimizedContacts();

  // Derive loading states for compatibility
  const isCreating = false; // Will be true during actual operations
  const isUpdating = false;
  const isDeleting = false;

  // Handle legacy URL redirections
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId) {
      navigate(`/contacts/${drawerId}`, { replace: true });
    }
  }, [location.search, navigate]);

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

  const handleCreateContact = async (contactData: CreateContactData) => {
    try {
      await createContact(contactData);
      // No need to manually refresh - useOptimizedContacts handles it
    } catch (error) {
      console.error('Error creating contact:', error);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
  };

  const handleUpdateContact = async (contactId: string, contactData: UpdateContactData) => {
    try {
      await updateContact(contactId, contactData);
      setEditingContact(null);
      // No need to manually refresh - useOptimizedContacts handles it
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este contacto?')) {
      try {
        await deleteContact(contactId);
        // No need to manually refresh - useOptimizedContacts handles it
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleViewContact = (contact: Contact) => {
    navigate(`/contacts/${contact.id}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: string) => {
    setFilterType(filter);
  };

  const handleFilterClick = () => {
    // Simple toggle for PersonRecordTable compatibility
    setFilterType(current => current === 'all' ? 'cliente' : 'all');
  };

  const filteredContacts = contacts?.filter(contact => {
    if (!contact) return false;
    
    const matchesSearch = !searchTerm || 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = !filterType || filterType === 'all' || contact.contact_type === filterType;
    
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="space-y-6">
      <ContactsHeader
        title="Contactos"
        description="Gestiona todas las personas de tu red de contactos"
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        onNewContact={() => setIsCreateModalOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredContacts.length}
      />

      {viewMode === 'grid' ? (
        <ContactsGrid
          contacts={filteredContacts}
          loading={isFetching}
          onView={handleViewContact}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      ) : (
        <PersonRecordTable
          contacts={filteredContacts}
          totalCount={filteredContacts.length}
          onRowClick={handleViewContact}
          onCreateContact={() => setIsCreateModalOpen(true)}
          onSearch={handleSearch}
          onFilter={handleFilterClick}
          isLoading={isFetching}
        />
      )}

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