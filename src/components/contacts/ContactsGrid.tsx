import React from 'react';
import { ContactCard } from './ContactCard';
import { useContactsContext } from '@/contexts';
import { Skeleton } from '@/components/ui/skeleton';

interface ContactsGridProps {
  onView?: (contact: any) => void;
  onEdit?: (contact: any) => void;
  onDelete?: (contactId: string) => void;
}

export const ContactsGrid = React.memo(({ 
  onView, 
  onEdit, 
  onDelete 
}: ContactsGridProps) => {
  // Get contacts data from context
  const { filteredContacts: contacts, loading } = useContactsContext();
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No hay contactos</p>
          <p className="text-sm">Comienza agregando tu primer contacto</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});