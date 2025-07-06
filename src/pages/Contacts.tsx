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

  // SIMPLIFIED FILTERING for debugging - be very permissive
  const filteredContacts = contacts?.filter(contact => {
    if (!contact) {
      console.log('⚠️ Found null/undefined contact in filter');
      return false;
    }
    
    const matchesSearch = !searchTerm || 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // SIMPLIFIED: Show all contacts when filter is 'all' or empty
    const matchesFilter = !filterType || filterType === 'all' || contact.contact_type === filterType;
    
    const shouldInclude = matchesSearch && matchesFilter;
    
    console.log('🔍 FILTERING CONTACT:', {
      name: contact.name,
      contact_type: contact.contact_type,
      filterType,
      searchTerm,
      matchesSearch,
      matchesFilter,
      shouldInclude
    });
    
    return shouldInclude;
  }) || [];

  // Enhanced debug logging
  console.log('🔍 SIMPLIFIED CONTACTS PAGE DEBUG:', {
    totalContacts: contacts?.length || 0,
    filteredContacts: filteredContacts.length,
    searchTerm,
    filterType,
    isLoading: isFetching,
    error: error,
    contactTypes: contacts?.map(c => c?.contact_type).filter(Boolean),
    firstFewContacts: contacts?.slice(0, 3).map(c => ({
      name: c?.name,
      email: c?.email,
      type: c?.contact_type,
      active: c?.is_active
    })),
    rawContactsData: contacts?.slice(0, 2) // Show first 2 contacts completely
  });


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
      
      {/* Debug button for testing */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <Button 
          onClick={() => {
            console.log('🔄 FORCE REFRESH: Clearing cache and refetching...');
            fetchContacts();
          }}
          variant="outline"
          size="sm"
          disabled={isFetching}
        >
          {isFetching ? '⏳ Loading...' : '🔄 Force Refresh'} ({filteredContacts.length})
        </Button>
        <div className="text-xs text-center text-muted-foreground">
          {isFetching ? 'Fetching...' : 'Ready'}
        </div>
      </div>

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