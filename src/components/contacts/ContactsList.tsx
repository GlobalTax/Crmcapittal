
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Mail, Phone, Building, User } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { AddContactDialog } from './AddContactDialog';
import { EditContactDialog } from './EditContactDialog';
import { ContactDetailsView } from './ContactDetailsView';
import { Contact, CONTACT_TYPES } from '@/types/Contact';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export const ContactsList = () => {
  const { contacts, loading } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || contact.contact_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const getContactTypeLabel = (type: string) => {
    return CONTACT_TYPES.find(t => t.value === type)?.label || type;
  };

  const getContactTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      buyer: 'bg-green-100 text-green-800',
      seller: 'bg-blue-100 text-blue-800',
      advisor: 'bg-purple-100 text-purple-800',
      lawyer: 'bg-yellow-100 text-yellow-800',
      banker: 'bg-indigo-100 text-indigo-800',
      accountant: 'bg-pink-100 text-pink-800',
      consultant: 'bg-orange-100 text-orange-800',
      investor: 'bg-emerald-100 text-emerald-800',
      broker: 'bg-cyan-100 text-cyan-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar contactos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los tipos</option>
            {CONTACT_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Contacto
        </Button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <Card 
            key={contact.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedContact(contact)}
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    {contact.position && (
                      <p className="text-sm text-gray-600">{contact.position}</p>
                    )}
                  </div>
                </div>
                <Badge className={getContactTypeColor(contact.contact_type)}>
                  {getContactTypeLabel(contact.contact_type)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {contact.company && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2" />
                    {contact.company}
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {contact.email}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {contact.phone}
                  </div>
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
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron contactos
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedType !== 'all' 
              ? 'Intenta ajustar tus filtros de búsqueda'
              : 'Comienza añadiendo tu primer contacto'
            }
          </p>
          {!searchTerm && selectedType === 'all' && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Contacto
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddContactDialog 
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
