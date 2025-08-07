import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useContactsFiltered } from '@/hooks/useContactsFiltered';

interface StackedAvatarsProps {
  companyId: string;
  maxVisible?: number;
}

export const StackedAvatars = ({ companyId, maxVisible = 4 }: StackedAvatarsProps) => {
  const { data: contacts = [], isLoading } = useContactsFiltered({
    companyId,
    limit: maxVisible + 1 // Get one more to know if there are more
  });

  if (isLoading) {
    return (
      <div className="flex -space-x-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <div 
            key={i} 
            className="h-6 w-6 rounded-full bg-muted animate-pulse border border-background"
          />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        Sin contactos
      </div>
    );
  }

  const visibleContacts = contacts.slice(0, maxVisible);
  const remainingCount = Math.max(0, contacts.length - maxVisible);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex -space-x-1">
      {visibleContacts.map((contact, index) => (
        <Avatar 
          key={contact.id} 
          className="h-6 w-6 border border-background"
          style={{ zIndex: visibleContacts.length - index }}
        >
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div 
          className="h-6 w-6 rounded-full bg-muted border border-background flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-medium text-muted-foreground">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};