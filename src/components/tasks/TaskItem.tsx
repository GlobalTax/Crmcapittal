import { useState } from 'react';
import { Check, Trash2, Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Task } from '@/hooks/usePersonalTasks';
import { TagSelector } from './TagSelector';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => Promise<any>;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  onDelete: (taskId: string) => Promise<any>;
  allTags: string[];
}

export const TaskItem = ({ task, onComplete, onUpdate, onDelete, allTags }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editTags, setEditTags] = useState<string[]>(task.tags || []);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        tags: editTags,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditTags(task.tags || []);
    setIsEditing(false);
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            disabled={isUpdating}
            autoFocus
            className="text-base"
          />
          
          <TagSelector
            selectedTags={editTags}
            onTagsChange={setEditTags}
            allTags={allTags}
          />

          <div className="flex items-center gap-2 justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={!editTitle.trim() || isUpdating}
            >
              <Check className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-lg p-4 shadow-sm",
        "transition-all duration-200 hover:shadow-md hover:scale-[1.01]",
        "cursor-pointer",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isUpdating}
          className={cn(
            "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
            "transition-all duration-200",
            task.completed
              ? "bg-primary border-primary"
              : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
          )}
        >
          {task.completed && <Check className="h-3 w-3 text-primary-foreground" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-base font-medium mb-2 transition-all",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-normal px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
            className="h-8 w-8"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={isUpdating}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
