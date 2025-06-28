import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  LayoutGrid, 
  List, 
  BarChart3,
  Filter,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { Contact } from '@/types/Contact';
import { useAdvancedContacts } from '@/hooks/useAdvancedContacts';
import { ContactsDashboard } from './ContactsDashboard';
import { AdvancedContactFilters } from './AdvancedContactFilters';
import { BulkContactOperations } from './BulkContactOperations';
import { EnhancedAddContactDialog } from './EnhancedAddContactDialog';
import { EditContactDialog } from './EditContactDialog';
import { ContactDetailsView } from './ContactDetailsView';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export const EnhancedContactsList = () => {
  const { contacts, loading } = useAdvancedContacts();
  const [activeTab, setActiveTab] = useState('list');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Filtrar contactos basado en filtros avanzados
  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    
    return contacts.filter(contact => {
      // Búsqueda de texto
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          contact.name.toLowerCase().includes(searchTerm) ||
          contact.email?.toLowerCase().includes(searchTerm) ||
          contact.company?.toLowerCase().includes(searchTerm) ||
          contact.position?.toLowerCase().includes(searchTerm);
        
        if (!matchesSearch) return false;
      }

      // Filtros por tipo
      if (filters.contactTypes?.length > 0) {
        if (!filters.contactTypes.includes(contact.contact_type)) return false;
      }

      // Filtros por prioridad
      if (filters.priorities?.length > 0) {
        if (!filters.priorities.includes(contact.contact_priority || 'medium')) return false;
      }

      // Estado activo
      if (filters.isActive !== null) {
        if (contact.is_active !== filters.isActive) return false;
      }

      // Rango de inversión
      if (filters.investmentRange?.min || filters.investmentRange?.max) {
        const min = filters.investmentRange.min ? parseInt(filters.investmentRange.min) : 0;
        const max = filters.investmentRange.max ? parseInt(filters.investmentRange.max) : Infinity;
        
        const contactMin = contact.investment_capacity_min || 0;
        const contactMax = contact.investment_capacity_max || Infinity;
        
        if (contactMax < min || contactMin > max) return false;
      }

      // Última interacción
      if (filters.lastInteractionDays) {
        const daysAgo = parseInt(filters.lastInteractionDays);
        const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        
        if (!contact.last_interaction_date || 
            new Date(contact.last_interaction_date) < cutoffDate) {
          return false;
        }
      }

      return true;
    });
  }, [contacts, filters]);

  const handleContactSelect = (contact: Contact, selected: boolean) => {
    if (selected) {
      setSelectedContacts(prev => [...prev, contact]);
    } else {
      setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedContacts(filteredContacts);
    } else {
      setSelectedContacts([]);
    }
  };

  if (loading) {
    return <LoadingSkeleton viewMode="grid" />;
  }

  if (selectedContact) {
    return (
      <ContactDetailsView 
        contact={selectedContact}
        onBack={() => setSelectedContact(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con navegación por tabs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Contactos M&A</h1>
          <p className="text-gray-600 mt-2">
            Sistema avanzado para administrar contactos con funcionalidades específicas para M&A
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Contactos</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Comunicaciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <ContactsDashboard />
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros */}
            <div className="lg:col-span-1">
              <AdvancedContactFilters 
                onFiltersChange={setFilters}
                totalResults={filteredContacts.length}
              />
            </div>

            {/* Lista de contactos */}
            <div className="lg:col-span-3 space-y-6">
              {/* Operaciones masivas */}
              <BulkContactOperations
                selectedContacts={selectedContacts}
                onSelectionChange={setSelectedContacts}
                onBulkComplete={() => {
                  setSelectedContacts([]);
                  // Refetch data if needed
                }}
              />

              {/* Controles de vista */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    Seleccionar todos ({filteredContacts.length})
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contenido de contactos */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredContacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className="hover:shadow-lg transition-shadow cursor-pointer relative"
                    >
                      <div className="absolute top-4 left-4 z-10">
                        <Checkbox
                          checked={selectedContacts.some(c => c.id === contact.id)}
                          onCheckedChange={(checked) => handleContactSelect(contact, checked as boolean)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      <div onClick={() => setSelectedContact(contact)}>
                        <CardHeader className="pb-4 pl-12">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{contact.name}</CardTitle>
                              {contact.position && (
                                <p className="text-sm text-gray-600">{contact.position}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              <Badge className={`text-xs ${
                                contact.contact_priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                contact.contact_priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                contact.contact_priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {contact.contact_priority || 'medium'}
                              </Badge>
                              {!contact.is_active && (
                                <Badge variant="secondary" className="text-xs">
                                  Inactivo
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {contact.company && (
                              <p className="text-sm text-gray-600">🏢 {contact.company}</p>
                            )}
                            {contact.email && (
                              <p className="text-sm text-gray-600">✉️ {contact.email}</p>
                            )}
                            {contact.phone && (
                              <p className="text-sm text-gray-600">📞 {contact.phone}</p>
                            )}
                            {contact.contact_source && (
                              <p className="text-sm text-gray-600">📍 {contact.contact_source}</p>
                            )}
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-500">
                              {new Date(contact.created_at).toLocaleDateString()}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingContact(contact);
                              }}
                            >
                              Editar
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // Vista de tabla - implementar cuando sea necesario
                <div className="text-center py-8">
                  <p>Vista de tabla - Por implementar</p>
                </div>
              )}

              {filteredContacts.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron contactos
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ajusta los filtros o añade nuevos contactos
                  </p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Contacto
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Vista de Calendario</h3>
            <p className="text-gray-600">Recordatorios y citas con contactos</p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Centro de Comunicaciones</h3>
            <p className="text-gray-600">Templates, historial y análisis de comunicaciones</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Add Contact Dialog */}
      <EnhancedAddContactDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
      
      {editingContact && (
        <EditContactDialog
          contact={editingContact}
          open={!!editingContact}
          onOpenChange={(open) => !open && setEditingContact(null)}
        />
      )}
    </div>
  );
};
