import React, { useMemo } from "react";
import { TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Phone, Mail, Eye } from "lucide-react";
import { Contact, ContactType } from "@/types/Contact";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { VirtualTable } from "@/components/ui/VirtualTable";

interface OptimizedContactsTableProps {
  contacts: Contact[];
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  onViewContact?: (contact: Contact) => void;
}

export const OptimizedContactsTable = React.memo<OptimizedContactsTableProps>(({ 
  contacts,
  onEditContact,
  onDeleteContact,
  onViewContact
}) => {
  const getTypeBadge = (type: ContactType) => {
    const typeConfig = {
      marketing: { label: "Marketing", color: "bg-pink-100 text-pink-800" },
      sales: { label: "Ventas", color: "bg-blue-100 text-blue-800" },
      franquicia: { label: "Franquicia", color: "bg-green-100 text-green-800" },
      cliente: { label: "Cliente", color: "bg-purple-100 text-purple-800" },
      prospect: { label: "Prospect", color: "bg-gray-100 text-gray-800" },
      other: { label: "Otro", color: "bg-gray-100 text-gray-800" }
    };
    
    const config = typeConfig[type];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderContactRow = useMemo(() => (contact: Contact, index: number) => (
    <TableRow key={contact.id} className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-gray-900">
              {contact.name}
            </div>
            {contact.email && (
              <div className="text-sm text-gray-500 flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="text-sm text-gray-500 flex items-center">
                <Phone className="h-3 w-3 mr-1" />
                {contact.phone}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{contact.company || 'N/A'}</div>
          <div className="text-sm text-gray-500">{contact.position || 'N/A'}</div>
        </div>
      </TableCell>
      
      <TableCell>
        {getTypeBadge(contact.contact_type)}
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-gray-600">
          {contact.contact_source || 'N/A'}
        </span>
      </TableCell>
      
      <TableCell>
        <div className="text-sm text-gray-900">
          {formatDate(contact.created_at)}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onViewContact && (
              <DropdownMenuItem onClick={() => onViewContact(contact)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onEditContact?.(contact)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteContact?.(contact.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ), [onEditContact, onDeleteContact, onViewContact]);

  const tableHeaders = (
    <TableRow>
      <TableHead>Contacto</TableHead>
      <TableHead>Empresa</TableHead>
      <TableHead>Tipo</TableHead>
      <TableHead>Origen</TableHead>
      <TableHead>Creado</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  );

  if (contacts.length > 100) {
    return (
      <VirtualTable
        data={contacts}
        itemHeight={80}
        containerHeight={600}
        renderRow={renderContactRow}
        headers={tableHeaders}
        keyExtractor={(contact) => contact.id}
      />
    );
  }

  // For smaller lists, use regular table
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          {tableHeaders}
        </thead>
        <tbody>
          {contacts.map((contact, index) => renderContactRow(contact, index))}
        </tbody>
      </table>
    </div>
  );
});

OptimizedContactsTable.displayName = 'OptimizedContactsTable';