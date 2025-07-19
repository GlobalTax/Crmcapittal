
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMandateTasks } from '@/hooks/useMandateTasks';

interface CreateTaskFormProps {
  mandateId: string;
  onSuccess: () => void;
}

export const CreateTaskForm = ({ mandateId, onSuccess }: CreateTaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const { createTask } = useMandateTasks(mandateId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const result = await createTask({
      mandate_id: mandateId,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: dueDate || undefined,
      completed: false
    });

    if (result.data) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      onSuccess();
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Crear Nueva Tarea</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Título de la Tarea</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Revisar documentación legal"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Descripción</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción detallada de la tarea..."
            className="min-h-[80px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Prioridad</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baja</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Fecha Límite</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="submit">Crear Tarea</Button>
        </div>
      </form>
    </DialogContent>
  );
};
