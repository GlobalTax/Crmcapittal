import React from 'react';
import { Contact } from '@/types/Contact';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  Edit,
  Archive,
  Trash2
} from 'lucide-react';

interface QuickActionsMenuProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contactId: string) => void;
  onArchive?: (contactId: string) => void;
  onScheduleCall?: (contact: Contact) => void;
  onSendEmail?: (contact: Contact) => void;
  onAddNote?: (contact: Contact) => void;
}

export const QuickActionsMenu = ({
  contact,
  onEdit,
  onDelete,
  onArchive,
  onScheduleCall,
  onSendEmail,
  onAddNote
}: QuickActionsMenuProps) => {
  const handleSendEmail = () => {
    if (contact.email) {
      if (onSendEmail) {
        onSendEmail(contact);
      } else {
        window.open(`mailto:${contact.email}`, '_blank');
      }
    }
  };

  const handleCall = () => {
    if (contact.phone) {
      window.open(`tel:${contact.phone}`, '_blank');
    }
  };

  const handleScheduleCall = () => {
    if (onScheduleCall) {
      onScheduleCall(contact);
    } else {
      // Fallback to calendar integration
      console.log('Schedule call with', contact.name);
    }
  };

  const handleAddNote = () => {
    if (onAddNote) {
      onAddNote(contact);
    } else {
      console.log('Add note for', contact.name);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(contact);
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(contact.id);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`¿Estás seguro de que quieres eliminar a ${contact.name}?`)) {
      onDelete(contact.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Communication Actions */}
        <DropdownMenuItem 
          onClick={handleSendEmail}
          disabled={!contact.email}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Enviar email
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleCall}
          disabled={!contact.phone}
          className="flex items-center gap-2"
        >
          <Phone className="h-4 w-4" />
          Llamar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleScheduleCall}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Programar llamada
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleAddNote}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Añadir nota
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Management Actions */}
        <DropdownMenuItem 
          onClick={handleEdit}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Editar contacto
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleArchive}
          className="flex items-center gap-2"
        >
          <Archive className="h-4 w-4" />
          Archivar
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};