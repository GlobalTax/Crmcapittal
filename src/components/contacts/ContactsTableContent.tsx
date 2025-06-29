
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  User
} from "lucide-react";
import { Contact, ContactType } from "@/types/Contact";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ContactsTableContentProps {
  filteredContacts: Contact[];
  totalContacts: number;
  searchTerm: string;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
}

export const ContactsTableContent = ({ 
  filteredContacts,
  totalContacts,
  searchTerm,
  onEditContact,
  onDeleteContact
}: ContactsTableContentProps) => {
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

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      low: { label: "Baja", color: "bg-gray-100 text-gray-800" },
      medium: { label: "Media", color: "bg-yellow-100 text-yellow-800" },
      high: { label: "Alta", color: "bg-red-100 text-red-800" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {filteredContacts.length} contactos
          {searchTerm && ` (filtrados de ${totalContacts})`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contacto</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
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
                    {getPriorityBadge(contact.contact_priority)}
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
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron contactos
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 
                "Intenta con otros términos de búsqueda" : 
                "Crea tu primer contacto para comenzar"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
