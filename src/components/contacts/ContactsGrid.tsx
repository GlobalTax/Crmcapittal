import { Contact } from "@/types/Contact";
import { ContactCard } from "./ContactCard";
import { Button } from "@/components/ui/button";
import { Users, Search, Plus } from "lucide-react";

interface ContactsGridProps {
  contacts: Contact[];
  onViewContact?: (contact: Contact) => void;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  onCreateContact?: () => void;
  isLoading?: boolean;
  searchTerm?: string;
}

export function ContactsGrid({
  contacts,
  onViewContact,
  onEditContact,
  onDeleteContact,
  onCreateContact,
  isLoading,
  searchTerm
}: ContactsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="space-y-2">
                <div className="w-24 h-4 bg-muted rounded"></div>
                <div className="w-16 h-3 bg-muted rounded"></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="w-full h-3 bg-muted rounded"></div>
              <div className="w-3/4 h-3 bg-muted rounded"></div>
              <div className="w-1/2 h-3 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-6">
          {searchTerm ? (
            <Search className="h-8 w-8 text-muted-foreground" />
          ) : (
            <Users className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {searchTerm ? 'No se encontraron contactos' : 'No tienes contactos aún'}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          {searchTerm 
            ? 'Intenta modificar los términos de búsqueda o crear un nuevo contacto.'
            : 'Comienza agregando tu primer contacto para gestionar mejor tus relaciones comerciales.'
          }
        </p>
        {onCreateContact && (
          <Button onClick={onCreateContact} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Contacto
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onView={onViewContact}
          onEdit={onEditContact}
          onDelete={onDeleteContact}
        />
      ))}
    </div>
  );
}