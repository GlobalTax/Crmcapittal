import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/minimal/Table";
import { Button } from "@/components/ui/minimal/Button";
import { Badge } from "@/components/ui/minimal/Badge";
import { 
  Mail,
  Phone,
  User
} from "lucide-react";
import { Contact, ContactType } from "@/types/Contact";
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
      marketing: { label: "Marketing", color: "blue" as const },
      sales: { label: "Ventas", color: "blue" as const },
      franquicia: { label: "Franquicia", color: "green" as const },
      cliente: { label: "Cliente", color: "red" as const },
      prospect: { label: "Prospect", color: "gray" as const },
      other: { label: "Otro", color: "gray" as const }
    };
    
    const config = typeConfig[type];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      low: { label: "Baja", color: "gray" as const },
      medium: { label: "Media", color: "yellow" as const },
      high: { label: "Alta", color: "red" as const }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Contactos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus contactos y leads</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">Filtros</Button>
          <Button variant="secondary">Exportar</Button>
          <CreateContactDialog onCreateContact={onCreateContact} isCreating={isCreating} />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar contactos por nombre, email o empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border flex flex-col">
          <span className="text-gray-500 text-sm">Total Contactos</span>
          <span className="text-3xl font-bold mt-2">{contacts.length}</span>
        </div>
        <div className="bg-white rounded-lg p-6 border flex flex-col">
          <span className="text-gray-500 text-sm">Clientes</span>
          <span className="text-3xl font-bold mt-2 text-red-600">
            {contacts.filter(c => c.contact_type === 'cliente').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border flex flex-col">
          <span className="text-gray-500 text-sm">Franquicias</span>
          <span className="text-3xl font-bold mt-2 text-green-600">
            {contacts.filter(c => c.contact_type === 'franquicia').length}
          </span>
        </div>
        <div className="bg-white rounded-lg p-6 border flex flex-col">
          <span className="text-gray-500 text-sm">Prospects</span>
          <span className="text-3xl font-bold mt-2 text-blue-600">
            {contacts.filter(c => c.contact_type === 'prospect').length}
          </span>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            {filteredContacts.length} contactos
            {searchTerm && ` (filtrados de ${contacts.length})`}
          </h3>
        </div>
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableHead>Contacto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Origen</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
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
                    <div className="flex gap-2 justify-end">
                      {onViewContact && (
                        <button 
                          onClick={() => onViewContact(contact)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Ver
                        </button>
                      )}
                      <button 
                        onClick={() => onEditContact?.(contact)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => onDeleteContact?.(contact.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
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
        </div>
      </div>
    </div>
  );
};
