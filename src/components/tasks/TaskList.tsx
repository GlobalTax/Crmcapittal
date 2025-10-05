import { TaskItem } from './TaskItem';
import { Task } from '@/hooks/usePersonalTasks';

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: string) => Promise<any>;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<any>;
  onDelete: (taskId: string) => Promise<any>;
  allTags: string[];
}

export const TaskList = ({ tasks, onComplete, onUpdate, onDelete, allTags }: TaskListProps) => {
  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className="animate-fade-in"
          style={{
            animationDelay: `${index * 30}ms`,
            animationFillMode: 'backwards'
          }}
        >
          <TaskItem
            task={task}
            onComplete={onComplete}
            onUpdate={onUpdate}
            onDelete={onDelete}
            allTags={allTags}
          />
        </div>
      ))}
    </div>
  );
};
