import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lead } from '@/types/Lead';
import { useLeadNotes } from '@/hooks/useLeadNotesSimple';
import { Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadNotesTabProps {
  lead: Lead;
}

export const LeadNotesTab = ({ lead }: LeadNotesTabProps) => {
  const { notes, isLoading, createNote, updateNote, deleteNote, isCreating } = useLeadNotes(lead.id);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState('general');
  const [editNote, setEditNote] = useState('');
  const [editNoteType, setEditNoteType] = useState('general');

  const handleCreateNote = async () => {
    if (!newNote.trim()) return;
    
    createNote({
      lead_id: lead.id,
      note: newNote,
      note_type: newNoteType,
    });
    
    setNewNote('');
    setNewNoteType('general');
    setIsAddingNote(false);
  };

  const handleStartEdit = (noteId: string, currentNote: string, currentType: string) => {
    setEditingNoteId(noteId);
    setEditNote(currentNote);
    setEditNoteType(currentType);
  };

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editNote.trim()) return;
    
    updateNote({
      id: editingNoteId,
      updates: {
        note: editNote,
        note_type: editNoteType,
      },
    });
    
    setEditingNoteId(null);
    setEditNote('');
    setEditNoteType('general');
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNote('');
    setEditNoteType('general');
  };

  const getNoteTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'important': return 'destructive';
      case 'meeting': return 'default';
      case 'follow_up': return 'secondary';
      default: return 'outline';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'important': return 'Importante';
      case 'meeting': return 'Reunión';
      case 'follow_up': return 'Seguimiento';
      default: return 'General';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Note Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notas del Lead</CardTitle>
            {!isAddingNote && (
              <Button 
                onClick={() => setIsAddingNote(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Nota
              </Button>
            )}
          </div>
        </CardHeader>
        
        {isAddingNote && (
          <CardContent className="pt-0">
            <div className="space-y-4 border rounded-lg p-4 bg-muted/50">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Textarea
                    placeholder="Escribe tu nota aquí..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="w-40">
                  <Select value={newNoteType} onValueChange={setNewNoteType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="important">Importante</SelectItem>
                      <SelectItem value="meeting">Reunión</SelectItem>
                      <SelectItem value="follow_up">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateNote}
                  disabled={isCreating || !newNote.trim()}
                  size="sm"
                >
                  {isCreating ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingNote(false);
                    setNewNote('');
                    setNewNoteType('general');
                  }}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay notas para este lead. Agrega la primera nota.
              </p>
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                {editingNoteId === note.id ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Textarea
                          value={editNote}
                          onChange={(e) => setEditNote(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="w-40">
                        <Select value={editNoteType} onValueChange={setEditNoteType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="important">Importante</SelectItem>
                            <SelectItem value="meeting">Reunión</SelectItem>
                            <SelectItem value="follow_up">Seguimiento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} size="sm" className="gap-2">
                        <Save className="h-4 w-4" />
                        Guardar
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit} size="sm" className="gap-2">
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getNoteTypeBadgeColor(note.note_type)}>
                          {getNoteTypeLabel(note.note_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(note.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(note.id, note.note, note.note_type)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNote(note.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};