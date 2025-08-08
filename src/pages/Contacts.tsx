import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PersonModal } from "@/components/contacts/PersonModal";
import { EditContactDialog } from "@/components/contacts/EditContactDialog";
import { UltraDenseContactsHeader } from "@/components/contacts/UltraDenseContactsHeader";
import { ContactsInlineStats } from "@/components/contacts/ContactsInlineStats";
import { MinimalFilterTabs } from "@/components/contacts/MinimalFilterTabs";
import { UltraDenseContactsTable } from "@/components/contacts/UltraDenseContactsTable";
import { CompactContactModal } from "@/components/contacts/CompactContactModal";
import { useOptimizedContacts } from '@/hooks/useOptimizedContacts';
import { Contact, CreateContactData, UpdateContactData } from "@/types/Contact";

export default function Contacts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [viewingContact, setViewingContact] = React.useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");

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
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId) {
      navigate(`/contactos/${drawerId}`, { replace: true });
    }
  }, [location.search, navigate]);

  // Keyboard shortcut for new person
  React.useEffect(() => {
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
    setViewingContact(contact);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  const handleStatClick = (filter: string) => {
    setActiveFilter(filter);
  };

  const filteredContacts = contacts?.filter(contact => {
    if (!contact) return false;
    
    const matchesSearch = !searchTerm || 
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (activeFilter) {
      case 'active':
        matchesFilter = contact.contact_status === 'active';
        break;
      case 'inactive':
        matchesFilter = !contact.last_contact_date || 
          (Date.now() - new Date(contact.last_contact_date).getTime()) > (30 * 24 * 60 * 60 * 1000);
        break;
      case 'vip':
        matchesFilter = contact.contact_priority === 'high' || contact.tags_array?.includes('VIP');
        break;
      case 'new':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesFilter = new Date(contact.created_at) >= weekAgo;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="p-6">
      {/* Ultra Dense Header */}
      <UltraDenseContactsHeader
        searchValue={searchTerm}
        onSearchChange={handleSearch}
        onCreateContact={() => setIsCreateModalOpen(true)}
      />

      {/* Inline Stats */}
      <ContactsInlineStats
        contacts={contacts || []}
        onStatClick={handleStatClick}
      />

      {/* Minimal Filter Tabs */}
      <MinimalFilterTabs
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Ultra Dense Table */}
      <UltraDenseContactsTable
        contacts={filteredContacts}
        onContactClick={handleViewContact}
        onCreateContact={() => setIsCreateModalOpen(true)}
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

      {/* Compact Contact Modal */}
      <CompactContactModal
        contact={viewingContact}
        open={!!viewingContact}
        onOpenChange={(open) => !open && setViewingContact(null)}
      />
    </div>
  );
}