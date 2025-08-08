import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePersonalTasks } from '@/hooks/usePersonalTasks';
import { TaskModal } from './TaskModal';
import { cn } from '@/lib/utils';
import { CheckCircle, Plus, GripVertical } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TaskItemProps {
  task: any;
  onComplete: (taskId: string) => void;
}

const TaskItem = ({ task, onComplete }: TaskItemProps) => {
  const priorityColors = {
    urgent: 'destructive' as const,
    high: 'default' as const,
    medium: 'secondary' as const,
    low: 'outline' as const
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-card border rounded-lg")}
    >
      <div className="opacity-40">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <button
        onClick={() => onComplete(task.id)}
        className="text-green-600 hover:text-green-700"
      >
        <CheckCircle className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-muted-foreground truncate">{task.description}</p>
        )}
      </div>
      <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]}>
        {task.priority}
      </Badge>
    </div>
  );
};

interface PanelTareasTodayProps {
  className?: string;
}

export const PanelTareasToday = ({ className }: PanelTareasTodayProps) => {
  const { tasks, completeTask, loading } = usePersonalTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const todayTasks = tasks.filter(task => !task.completed);

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast({
        title: "¡Tarea completada!",
        description: "La tarea ha sido marcada como completada.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la tarea.",
        variant: "destructive",
      });
    }
  };

  // Eliminado DnD por estabilidad en esta vista


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Tareas de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p>¡No hay tareas pendientes!</p>
              <p className="text-xs">Disfruta de tu día libre</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={handleComplete}
              />
            ))
          )}
        </div>
      </CardContent>

      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </Card>
  );
};