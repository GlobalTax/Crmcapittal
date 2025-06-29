
import { useState, useMemo } from "react";
import { Contact, ContactType } from "@/types/Contact";
import { ContactsTableHeader } from "./ContactsTableHeader";
import { ContactsSearchBar } from "./ContactsSearchBar";
import { ContactsStatsCards } from "./ContactsStatsCards";
import { ContactsTableContent } from "./ContactsTableContent";

interface ContactsTableProps {
  contacts: Contact[];
  onCreateContact: (contactData: any) => void;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

export const ContactsTable = ({ 
  contacts = [], 
  onCreateContact,
  onEditContact,
  onDeleteContact,
  isLoading = false,
  isCreating = false
}: ContactsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<ContactType | "all">("all");

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ContactsTableHeader 
        onCreateContact={onCreateContact} 
        isCreating={isCreating} 
      />

      <ContactsSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <ContactsStatsCards contacts={contacts} />

      <ContactsTableContent
        filteredContacts={filteredContacts}
        totalContacts={contacts.length}
        searchTerm={searchTerm}
        onEditContact={onEditContact}
        onDeleteContact={onDeleteContact}
      />
    </div>
  );
};
