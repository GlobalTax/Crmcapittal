
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  User, 
  Calendar,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Contact, CONTACT_TYPES } from '@/types/Contact';
import { useContactNotes } from '@/hooks/useContacts';
import { EditContactDialog } from './EditContactDialog';

interface ContactDetailsViewProps {
  contact: Contact;
  onBack: () => void;
}

export const ContactDetailsView = ({ contact, onBack }: ContactDetailsViewProps) => {
  const { notes, addNote, loading: notesLoading } = useContactNotes(contact.id);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

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

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setAddingNote(true);
      await addNote(newNote);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
            <p className="text-gray-600">{contact.position}</p>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>
          Editar Contacto
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Información de Contacto</span>
                <Badge className={getContactTypeColor(contact.contact_type)}>
                  {getContactTypeLabel(contact.contact_type)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-medium">{contact.name}</p>
                  </div>
                </div>
                
                {contact.company && (
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Empresa</p>
                      <p className="font-medium">{contact.company}</p>
                    </div>
                  </div>
                )}
                
                {contact.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{contact.email}</p>
                    </div>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{contact.phone}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {contact.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">Notas</p>
                  <p className="text-gray-900">{contact.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Historial de Comunicaciones</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new note */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Añadir una nueva nota..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {addingNote ? 'Guardando...' : 'Añadir Nota'}
                  </Button>
                </div>
              </div>

              {/* Notes list */}
              <div className="space-y-3">
                {notesLoading ? (
                  <p className="text-center text-gray-500 py-4">Cargando notas...</p>
                ) : notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 mb-2">{note.note}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="capitalize">{note.note_type}</span>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No hay notas registradas para este contacto
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Creado</p>
                  <p className="text-sm font-medium">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-600">Notas</p>
                  <p className="text-sm font-medium">{notes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditContactDialog
        contact={contact}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
};
