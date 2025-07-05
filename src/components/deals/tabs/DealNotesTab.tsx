import React, { useState } from 'react';
import { Deal } from '@/types/Deal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, StickyNote } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

interface DealNotesTabProps {
  deal: Deal;
}

export const DealNotesTab = ({ deal }: DealNotesTabProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    // Mock note creation - in real implementation, this would save to database
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.trim(),
      created_at: new Date().toISOString(),
      created_by: deal.ownerId || 'current-user'
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Add Note Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Notes</h3>
          {!isAdding && (
            <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
        
        {isAdding && (
          <div className="space-y-2">
            <Textarea
              placeholder="Write a note about this deal..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
              autoFocus
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                Save Note
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setIsAdding(false);
                setNewNote('');
              }}>
                Cancel
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
              <p>No notes yet</p>
              <p className="text-xs">Add notes to keep track of important information</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-neutral-0 border border-border rounded-lg p-4 space-y-2"
              >
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>By you</span>
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