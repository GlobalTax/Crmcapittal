import React, { useMemo } from "react";
import { TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Edit, Trash2, Phone, Mail, Eye } from "lucide-react";
import { Contact, ContactType } from "@/types/Contact";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FixedSizeList as List } from 'react-window';

interface OptimizedContactsTableProps {
  contacts: Contact[];
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  onViewContact?: (contact: Contact) => void;
  isLoading?: boolean;
}

export const OptimizedContactsTable = React.memo<OptimizedContactsTableProps>(({ 
  contacts,
  onEditContact,
  onDeleteContact,
  onViewContact,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-10 bg-muted/50 rounded animate-pulse" />
        <div className="border rounded">
          <div className="h-10 bg-muted/50 animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 border-t bg-muted/30 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

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

  // Virtualización para listas grandes
  if (contacts.length > 100) {
    const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
      const contact = contacts[index];
      return (
        <div style={style} className="flex items-center border-b hover:bg-muted/50 px-4">
          <div className="grid grid-cols-12 gap-4 w-full items-center">
            <div className="col-span-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 text-orange-700 text-xs">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    {contact.email && <Mail className="h-3 w-3" />}
                    {contact.phone && <Phone className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3">
              <div className="font-medium">{contact.company || 'N/A'}</div>
              <div className="text-sm text-muted-foreground">{contact.position || 'N/A'}</div>
            </div>
            <div className="col-span-2">{getTypeBadge(contact.contact_type)}</div>
            <div className="col-span-2 text-sm text-muted-foreground">{contact.contact_source || 'N/A'}</div>
            <div className="col-span-1 text-sm">{formatDate(contact.created_at)}</div>
            <div className="col-span-1 text-right">
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
                  <DropdownMenuItem onClick={() => onDeleteContact?.(contact.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      );
    });

    return (
      <div className="rounded-md border">
        <div className="bg-muted/50 border-b">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 font-medium text-sm">
            <div className="col-span-4">Contacto</div>
            <div className="col-span-3">Empresa</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-2">Origen</div>
            <div className="col-span-1">Creado</div>
            <div className="col-span-1 text-right">Acciones</div>
          </div>
        </div>
        <List height={600} width="100%" itemCount={contacts.length} itemSize={80} overscanCount={5}>
          {Row}
        </List>
      </div>
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