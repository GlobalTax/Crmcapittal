import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContactsFiltered } from '@/hooks/useContactsFiltered';
import { Contact } from '@/types/Contact';

interface AutocompletedContactSelectorProps {
  value?: string;
  onValueChange: (contactId: string | null, contact: Contact | null) => void;
  companyId?: string | null;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onCreateNew?: () => void;
}

export function AutocompletedContactSelector({
  value,
  onValueChange,
  companyId,
  placeholder = "Seleccionar contacto...",
  disabled = false,
  className,
  onCreateNew
}: AutocompletedContactSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: contacts, isLoading } = useContactsFiltered({
    search: searchQuery,
    companyId: companyId || undefined,
    limit: 50
  });

  const selectedContact = contacts?.find(contact => contact.id === value);

  const handleSelect = (contactId: string) => {
    const contact = contacts?.find(c => c.id === contactId);
    onValueChange(contactId === value ? null : contactId, contact || null);
    setOpen(false);
  };

  const handleCreateNew = () => {
    setOpen(false);
    onCreateNew?.();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {selectedContact ? (
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{selectedContact.name}</div>
                {(selectedContact.email || selectedContact.position) && (
                  <div className="text-sm text-muted-foreground truncate">
                    {[selectedContact.position, selectedContact.email]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder={companyId ? "Buscar contacto en la empresa..." : "Buscar contacto..."}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? (
                "Buscando contactos..."
              ) : (
                <div className="text-center py-6">
                  <div className="text-sm text-muted-foreground mb-2">
                    {companyId 
                      ? "No se encontraron contactos en esta empresa"
                      : "No se encontraron contactos"
                    }
                  </div>
                  {onCreateNew && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateNew}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      {companyId 
                        ? "Crear contacto en esta empresa"
                        : "Crear nuevo contacto"
                      }
                    </Button>
                  )}
                </div>
              )}
            </CommandEmpty>
            {contacts && contacts.length > 0 && (
              <CommandGroup>
                {onCreateNew && (
                  <CommandItem
                    value="__create_new__"
                    onSelect={handleCreateNew}
                    className="border-b mb-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    <div>
                      <div className="font-medium">
                        {companyId 
                          ? "Crear contacto en esta empresa"
                          : "Crear nuevo contacto"
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Agregar un contacto que no está en la lista
                      </div>
                    </div>
                  </CommandItem>
                )}
                {contacts.map((contact) => (
                  <CommandItem
                    key={contact.id}
                    value={contact.id}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === contact.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{contact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {[contact.position, contact.email]
                          .filter(Boolean)
                          .join(' • ')}
                      </div>
                      {contact.phone && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {contact.phone}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}