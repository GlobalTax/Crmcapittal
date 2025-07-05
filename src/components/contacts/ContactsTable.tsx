import React, { useState, useMemo } from "react";
import { Contact, ContactType, CreateContactData } from "@/types/Contact";
import { ContactsHeader } from "./ContactsHeader";
import { ContactsGrid } from "./ContactsGrid";
import { CreateContactDialog } from "./CreateContactDialog";
import { usePerformanceMonitor } from "@/hooks/performance/usePerformanceMonitor";
import { toast } from "sonner";

interface ContactsTableProps {
  contacts: Contact[];
  onCreateContact: (contactData: CreateContactData) => void;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  onViewContact?: (contact: Contact) => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

export function ContactsTable({
  contacts,
  onCreateContact,
  onEditContact,
  onDeleteContact,
  onViewContact,
  isLoading,
  isCreating
}: ContactsTableProps) {
  const { renderCount } = usePerformanceMonitor('ContactsTable');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ContactType | "all">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = 
        contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        "";
      
      const matchesType = filterType === "all" || contact.contact_type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [contacts, searchTerm, filterType]);

  const handleCreateContact = () => {
    setShowCreateDialog(true);
  };

  const handleCreateContactSubmit = (contactData: CreateContactData) => {
    onCreateContact(contactData);
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      <ContactsHeader
        contacts={contacts}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateContact={handleCreateContact}
        onFilterToggle={() => setShowFilters(!showFilters)}
      />

      {/* Filter Panel - collapsible */}
      {showFilters && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ContactType | "all")}
              className="px-3 py-2 border border-input rounded-md text-sm bg-background"
            >
              <option value="all">Todos los tipos</option>
              <option value="marketing">Marketing</option>
              <option value="sales">Ventas</option>
              <option value="franquicia">Franquicia</option>
              <option value="cliente">Cliente</option>
              <option value="prospect">Prospect</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-foreground">
            {filteredContacts.length} contactos
            {searchTerm && ` (filtrados de ${contacts.length})`}
          </h3>
        </div>
        
        <ContactsGrid
          contacts={filteredContacts}
          onViewContact={onViewContact}
          onEditContact={onEditContact}
          onDeleteContact={onDeleteContact}
          onCreateContact={handleCreateContact}
          isLoading={isLoading}
          searchTerm={searchTerm}
        />
      </div>

      <CreateContactDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateContact={handleCreateContactSubmit}
        isCreating={isCreating}
      />
    </div>
  );
};
