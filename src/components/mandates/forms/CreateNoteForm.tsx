
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMandateNotes } from '@/hooks/useMandateNotes';

interface CreateNoteFormProps {
  mandateId: string;
  onSuccess: () => void;
}

export const CreateNoteForm = ({ mandateId, onSuccess }: CreateNoteFormProps) => {
  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const { createNote } = useMandateNotes(mandateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    const result = await createNote({
      mandate_id: mandateId,
      note: note.trim(),
      note_type: noteType
    });

    if (result.data) {
      setNote('');
      setNoteType('general');
      onSuccess();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Añadir Nueva Nota</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Tipo de Nota</label>
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="client_feedback">Feedback del Cliente</SelectItem>
              <SelectItem value="internal">Nota Interna</SelectItem>
              <SelectItem value="meeting">Reunión</SelectItem>
              <SelectItem value="follow_up">Seguimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium">Nota</label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="min-h-[100px]"
            required
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="submit">Guardar Nota</Button>
        </div>
      </form>
    </DialogContent>
  );
};
