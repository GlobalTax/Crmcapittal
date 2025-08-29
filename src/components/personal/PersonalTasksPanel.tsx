import { useState } from 'react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/minimal/Badge';
import { Button } from '@/components/ui/minimal/Button';
import { usePersonalTasks } from '@/hooks/usePersonalTasks';
import { CheckCircle, Plus } from 'lucide-react';
import { TaskModal } from './TaskModal';
import { logger } from '@/utils/productionLogger';

export const PersonalTasksPanel = () => {
  const { tasks, completeTask, loading } = usePersonalTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const todayTasks = tasks.filter(task => !task.completed);

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      logger.error('Error completing task', { error, taskId }, 'PersonalTasksPanel');
    }
  };

  return (
    <>
      <DashboardCard title="Tareas de Hoy" icon={CheckCircle}>
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            className="w-full"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : todayTasks.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="¡No hay tareas pendientes!"
                subtitle="Disfruta de tu día libre"
              />
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 border rounded">
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
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
                  <Badge color={task.priority === 'urgent' ? 'red' : task.priority === 'high' ? 'yellow' : 'gray'}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      </DashboardCard>

      <TaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};