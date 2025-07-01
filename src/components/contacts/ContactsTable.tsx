import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  Building2,
  User,
  Eye
} from "lucide-react";
import { Contact, ContactType } from "@/types/Contact";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CreateContactDialog } from "./CreateContactDialog";

interface ContactsTableProps {
  contacts: Contact[];
  onCreateContact: (contactData: any) => void;
  onEditContact?: (contact: Contact) => void;
  onDeleteContact?: (contactId: string) => void;
  onViewContact?: (contact: Contact) => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

export const ContactsTable = ({ 
  contacts = [], 
  onCreateContact,
  onEditContact,
  onDeleteContact,
  onViewContact,
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Contactos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus contactos y leads</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-gray-300">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" className="border-gray-300">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <CreateContactDialog onCreateContact={onCreateContact} isCreating={isCreating} />
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar contactos por nombre, email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ContactType | "all")}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Ventas</option>
                <option value="franquicia">Franquicia</option>
                <option value="cliente">Cliente</option>
                <option value="prospect">Prospect</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contactos</p>
                <p className="text-2xl font-semibold text-gray-900">{contacts.length}</p>
              </div>
              <User className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {contacts.filter(c => c.contact_type === 'cliente').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Franquicias</p>
                <p className="text-2xl font-semibold text-green-600">
                  {contacts.filter(c => c.contact_type === 'franquicia').length}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prospects</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {contacts.filter(c => c.contact_type === 'prospect').length}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredContacts.length} contactos
            {searchTerm && ` (filtrados de ${contacts.length})`}
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
    </div>
  );
};
