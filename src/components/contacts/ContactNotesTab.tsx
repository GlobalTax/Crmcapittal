import { useState } from 'react';
import { useContactNotes, ContactNote } from '@/hooks/useContactNotes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  FileText, 
  Trash2, 
  Edit2 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ContactNotesTabProps {
  contactId: string;
  currentUserId: string;
}

export function ContactNotesTab({ contactId, currentUserId }: ContactNotesTabProps) {
  const { notes, loading, createNote, updateNote, deleteNote } = useContactNotes(contactId);
  const { toast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<ContactNote | null>(null);
  const [newNote, setNewNote] = useState({
    note: '',
    note_type: 'general' as const,
  });

  const noteTypes = {
    general: 'General',
    meeting: 'Reunión',
    call: 'Llamada',
    email: 'Email',
    task: 'Tarea',
    follow_up: 'Seguimiento'
  };

  const getTypeColor = (type: string) => {
    const colors = {
      general: 'outline',
      meeting: 'default',
      call: 'secondary',
      email: 'outline',
      task: 'destructive',
      follow_up: 'default'
    };
    return colors[type as keyof typeof colors] || 'outline';
  };

  const handleCreateNote = async () => {
    if (!newNote.note.trim()) return;
    
    try {
      await createNote({
        contact_id: contactId,
        note: newNote.note,
        note_type: newNote.note_type,
        created_by: currentUserId,
      });
      
      setNewNote({ note: '', note_type: 'general' });
      setShowCreateForm(false);
      
      toast({
        title: "Nota creada",
        description: "La nota ha sido creada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la nota.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.note.trim()) return;
    
    try {
      await updateNote(editingNote.id, {
        note: editingNote.note,
        note_type: editingNote.note_type,
      });
      
      setEditingNote(null);
      
      toast({
        title: "Nota actualizada",
        description: "La nota ha sido actualizada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la nota.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNote = async (note: ContactNote) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar esta nota?`)) {
      return;
    }

    try {
      await deleteNote(note.id);
      toast({
        title: "Nota eliminada",
        description: "La nota ha sido eliminada.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Cargando notas...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Botón para crear nueva nota */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notas del Contacto</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Nota
        </Button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Crear Nueva Nota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tipo de nota</label>
              <Select value={newNote.note_type} onValueChange={(value: any) => setNewNote({ ...newNote, note_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(noteTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Escribe tu nota aquí..."
              value={newNote.note}
              onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateNote}>Crear Nota</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de notas */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay notas para este contacto
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Crea tu primera nota usando el botón de arriba
              </p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-6">
                {editingNote?.id === note.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Tipo de nota</label>
                      <Select 
                        value={editingNote.note_type} 
                        onValueChange={(value: any) => setEditingNote({ ...editingNote, note_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(noteTypes).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      value={editingNote.note}
                      onChange={(e) => setEditingNote({ ...editingNote, note: e.target.value })}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateNote} size="sm">
                        Guardar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingNote(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTypeColor(note.note_type) as any}>
                          {noteTypes[note.note_type as keyof typeof noteTypes] || note.note_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingNote(note)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-sm whitespace-pre-wrap">
                      {note.note}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}