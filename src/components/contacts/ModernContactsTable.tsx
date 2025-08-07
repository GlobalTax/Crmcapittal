import React, { useState, useMemo } from 'react';
import { Contact } from '@/types/Contact';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ContactConnectionScore } from './ContactConnectionScore';
import { QuickActionsMenu } from './QuickActionsMenu';
import { Mail, Phone, MessageSquare, MoreHorizontal } from 'lucide-react';
import { EmptyStateSmall } from '@/components/ui/EmptyStateSmall';
import { Users } from 'lucide-react';

interface ModernContactsTableProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onCreateContact: () => void;
  isLoading?: boolean;
  selectedContacts?: string[];
  onContactSelect?: (contactId: string, selected: boolean) => void;
  onBulkAction?: (action: string, contactIds: string[]) => void;
}

export const ModernContactsTable = ({
  contacts,
  onContactClick,
  onCreateContact,
  isLoading,
  selectedContacts = [],
  onContactSelect,
  onBulkAction
}: ModernContactsTableProps) => {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatLastInteraction = (contact: Contact) => {
    const date = contact.last_contact_date || contact.updated_at;
    if (!date) return { text: 'Sin interacciones', type: '' };
    
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    let text = '';
    if (days === 0) text = 'Hoy';
    else if (days === 1) text = 'Ayer';
    else if (days < 7) text = `Hace ${days} días`;
    else if (days < 30) text = `Hace ${Math.floor(days / 7)} semanas`;
    else text = `Hace ${Math.floor(days / 30)} meses`;
    
    // Determine interaction type (simplified)
    const type = contact.email ? 'email' : contact.phone ? 'call' : 'meeting';
    
    return { text, type };
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-700 border-green-200">Activo</Badge>;
      case 'blocked':
        return <Badge className="bg-red-50 text-red-700 border-red-200">Bloqueado</Badge>;
      case 'archived':
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Archivado</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Inactivo</Badge>;
    }
  };

  const allSelected = selectedContacts.length === contacts.length && contacts.length > 0;
  const someSelected = selectedContacts.length > 0 && selectedContacts.length < contacts.length;

  const handleSelectAll = () => {
    if (allSelected) {
      // Deselect all
      contacts.forEach(contact => onContactSelect?.(contact.id, false));
    } else {
      // Select all
      contacts.forEach(contact => onContactSelect?.(contact.id, true));
    }
  };

  if (contacts.length === 0 && !isLoading) {
    return (
      <div className="bg-background rounded-lg border border-border">
        <div className="p-6">
          <EmptyStateSmall
            icon={<Users className="w-5 h-5 text-primary" />}
            text="No hay contactos que mostrar"
            action={<Button onClick={onCreateContact}>Crear primer contacto</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border border-border">
      {/* Bulk Actions Bar */}
      {selectedContacts.length > 0 && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedContacts.length} contacto{selectedContacts.length !== 1 ? 's' : ''} seleccionado{selectedContacts.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.('export', selectedContacts)}
              >
                Exportar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.('addTags', selectedContacts)}
              >
                Añadir etiquetas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction?.('delete', selectedContacts)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="w-12 p-4">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el && 'indeterminate' in el) {
                      (el as any).indeterminate = someSelected;
                    }
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Contacto</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Empresa</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Estado</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Score</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Última interacción</th>
              <th className="w-20 p-4"></th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => {
              const lastInteraction = formatLastInteraction(contact);
              const isSelected = selectedContacts.includes(contact.id);
              const isHovered = hoveredRow === contact.id;
              
              return (
                <tr
                  key={contact.id}
                  className="border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                  onMouseEnter={() => setHoveredRow(contact.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onContactClick(contact)}
                >
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onContactSelect?.(contact.id, !!checked)}
                    />
                  </td>
                  
                  {/* Contacto */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">{contact.name}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {contact.email || 'Sin email'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Empresa */}
                  <td className="p-4">
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">
                        {contact.company || '—'}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {contact.position || '—'}
                      </div>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="p-4">
                    {getStatusBadge(contact.contact_status)}
                  </td>

                  {/* Score */}
                  <td className="p-4">
                    <ContactConnectionScore contact={contact} />
                  </td>

                  {/* Última interacción */}
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="text-foreground">{lastInteraction.text}</div>
                      {lastInteraction.type && (
                        <div className="text-muted-foreground capitalize">{lastInteraction.type}</div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {isHovered ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(`mailto:${contact.email}`, '_blank')}
                          disabled={!contact.email}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => window.open(`tel:${contact.phone}`, '_blank')}
                          disabled={!contact.phone}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <QuickActionsMenu contact={contact} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border text-sm text-muted-foreground">
        {contacts.length} contacto{contacts.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};