import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PersonModal } from "@/components/contacts/PersonModal";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { ModernContactsHeader } from "@/components/contacts/ModernContactsHeader";
import { ModernContactsTable } from "@/components/contacts/ModernContactsTable";
import { useOptimizedContacts } from '@/hooks/useOptimizedContacts';
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'status' | 'company' | 'tags';
}

export default function Contacts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterChip[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

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
      navigate(`/contactos/${drawerId}`, { replace: true });
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
    navigate(`/contactos/${contact.id}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRemoveFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleAddFilter = (filter: FilterChip) => {
    setActiveFilters(prev => {
      const exists = prev.find(f => f.id === filter.id);
      if (exists) return prev;
      return [...prev, filter];
    });
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
  };

  const handleContactSelect = (contactId: string, selected: boolean) => {
    setSelectedContacts(prev => {
      if (selected) {
        return [...prev, contactId];
      } else {
        return prev.filter(id => id !== contactId);
      }
    });
  };

  const handleBulkAction = (action: string, contactIds: string[]) => {
    console.log('Bulk action:', action, contactIds);
    // Implement bulk actions here
    setSelectedContacts([]);
  };

  const filteredContacts = contacts?.filter(contact => {
    if (!contact) return false;
    
    const matchesSearch = !searchTerm || 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = activeFilters.every(filter => {
      switch (filter.type) {
        case 'status':
          return contact.contact_status === filter.value;
        case 'company':
          return contact.company?.toLowerCase().includes(filter.value.toLowerCase());
        case 'tags':
          return contact.tags_array?.includes(filter.value);
        default:
          return true;
      }
    });
    
    return matchesSearch && matchesFilters;
  }) || [];

  return (
    <div className="space-y-6 p-6">
      {/* Modern Header */}
      <ModernContactsHeader
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        onCreateContact={() => setIsCreateModalOpen(true)}
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onAddFilter={handleAddFilter}
        onClearAllFilters={handleClearAllFilters}
        totalCount={filteredContacts.length}
      />

      {/* Modern Table */}
      <ModernContactsTable
        contacts={filteredContacts}
        onContactClick={handleViewContact}
        onCreateContact={() => setIsCreateModalOpen(true)}
        isLoading={isFetching}
        selectedContacts={selectedContacts}
        onContactSelect={handleContactSelect}
        onBulkAction={handleBulkAction}
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