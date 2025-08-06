
import { Lead } from '@/types/Lead';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';

interface LeadNotesTabProps {
  lead: Lead;
}

export const LeadNotesTab = ({ lead }: LeadNotesTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState('');

  const handleSaveNote = () => {
    // TODO: Implement save note functionality
    setIsEditing(false);
    setNoteText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Notas del Lead</CardTitle>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => setIsEditing(true)}
              disabled={isEditing}
            >
              <Plus className="h-4 w-4" />
              Nueva Nota
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* New Note Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Añadir Nueva Nota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Escribe tu nota aquí..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleSaveNote}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false);
                  setNoteText('');
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes List */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No hay notas registradas para este lead.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Utiliza el botón "Nueva Nota" para añadir la primera nota.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
