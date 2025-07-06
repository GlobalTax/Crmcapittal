import { useState } from 'react';
import { Plus, StickyNote, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Company } from '@/types/Company';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompanyNotesTabProps {
  company: Company;
}

interface CompanyNote {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

export const CompanyNotesTab = ({ company }: CompanyNotesTabProps) => {
  const [notes, setNotes] = useState<CompanyNote[]>([
    // Mock data - replace with real API call
    {
      id: '1',
      content: 'Initial contact made via LinkedIn. Company shows interest in our enterprise solution.',
      created_at: new Date().toISOString(),
      created_by: 'user-1',
      created_by_name: 'John Doe'
    }
  ]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    const newNote: CompanyNote = {
      id: Date.now().toString(),
      content: newNoteContent,
      created_at: new Date().toISOString(),
      created_by: 'current-user',
      created_by_name: 'Current User'
    };

    setNotes([newNote, ...notes]);
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    });
  };

  if (notes.length === 0 && !isAddingNote) {
    return (
      <EmptyState
        icon={StickyNote}
        title="Aún no hay notas"
        subtitle="Añade notas sobre esta empresa para hacer seguimiento de información importante"
        action={{
          label: "Añadir Nota",
          onClick: () => setIsAddingNote(true)
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Notas de la Empresa ({notes.length})
        </h3>
        {!isAddingNote && (
          <Button onClick={() => setIsAddingNote(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Nota
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAddingNote && (
        <Card>
          <CardHeader className="pb-3">
            <h4 className="text-sm font-medium">Añadir Nueva Nota</h4>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Escribe tu nota sobre esta empresa..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddNote}>
                Guardar Nota
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingNote(false);
                  setNewNoteContent('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {note.created_by_name || 'Usuario Desconocido'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{getRelativeTime(note.created_at)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};