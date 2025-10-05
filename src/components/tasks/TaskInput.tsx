import { useState, KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/usePersonalTasks';
import { TagSelector } from './TagSelector';

interface TaskInputProps {
  onCreateTask: (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<any>;
  allTags: string[];
}

export const TaskInput = ({ onCreateTask, allTags }: TaskInputProps) => {
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      await onCreateTask({
        title: title.trim(),
        priority: 'medium',
        due_date: new Date().toISOString(),
        completed: false,
        category: 'admin',
        tags: selectedTags,
      });
      setTitle('');
      setSelectedTags([]);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <Input
            placeholder="Nueva tarea... (presiona Enter)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isCreating}
            className="border-0 bg-transparent focus-visible:ring-0 text-base px-0 placeholder:text-muted-foreground/60"
          />
          
          {title && (
            <div className="animate-fade-in">
              <TagSelector
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
                allTags={allTags}
              />
            </div>
          )}
        </div>

        <Button
          size="icon"
          onClick={handleCreate}
          disabled={!title.trim() || isCreating}
          className="shrink-0 transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
