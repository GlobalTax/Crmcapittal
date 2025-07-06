import React, { useState } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, StickyNote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTransaccionNotes, TransaccionNote } from '@/hooks/useTransaccionNotes';

interface TransaccionNotesTabProps {
  transaccion: Transaccion;
}

export const TransaccionNotesTab = ({ transaccion }: TransaccionNotesTabProps) => {
  const { notes, loading, createNote } = useTransaccionNotes(transaccion.id);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    await createNote({
      transaccion_id: transaccion.id,
      note: newNote.trim(),
      note_type: 'general'
    });
    
    setNewNote('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Add Note Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Notas</h3>
          {!isAdding && (
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar Nota
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="space-y-2">
            <Textarea
              placeholder="Escribe una nota sobre esta transacción..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                Guardar Nota
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Notes List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no hay notas</p>
              <p className="text-xs">Agrega notas para mantener registro de información importante</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-neutral-0 border border-border rounded-lg p-4 space-y-2"
              >
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {note.note}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Por ti</span>
                  <span>
                    {formatDistanceToNow(new Date(note.created_at), { 
                      addSuffix: true, 
                      locale: es 
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};