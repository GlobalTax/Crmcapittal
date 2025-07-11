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
import { PageHeader } from "@/components/ui/page-header";
import { StatsCard } from "@/components/ui/stats-card";
import { Users, UserPlus, Building2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

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

  // Calculate stats
  const totalContacts = filteredContacts.length;
  const activeContacts = filteredContacts.filter(c => c.contact_status === 'active').length;
  const companiesCount = new Set(filteredContacts.map(c => c.company).filter(Boolean)).size;
  const recentContacts = filteredContacts.filter(c => {
    const createdDate = new Date(c.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

  return (
    <div className="space-y-8">
      {/* Modern Page Header */}
      <PageHeader
        title="Contactos"
        description="Gestiona tu red de contactos profesionales y relaciones comerciales"
        badge={{ text: `${totalContacts} contactos`, variant: 'secondary' }}
        actions={
          <>
            <Button 
              variant="outline" 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'Vista Lista' : 'Vista Grid'}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Contacto
            </Button>
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Contactos"
          value={totalContacts.toLocaleString()}
          description="En tu red"
          icon={<Users className="h-5 w-5" />}
          trend={recentContacts > 0 ? {
            value: Math.round((recentContacts / totalContacts) * 100),
            label: "últimos 30 días",
            direction: 'up'
          } : undefined}
        />
        <StatsCard
          title="Contactos Activos"
          value={activeContacts.toLocaleString()}
          description="Disponibles"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Empresas"
          value={companiesCount.toLocaleString()}
          description="Organizaciones"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatsCard
          title="Nuevos"
          value={recentContacts.toLocaleString()}
          description="Últimos 30 días"
          icon={<UserPlus className="h-5 w-5" />}
        />
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos los tipos</option>
              <option value="cliente">Clientes</option>
              <option value="prospecto">Prospectos</option>
              <option value="colaborador">Colaboradores</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content */}
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