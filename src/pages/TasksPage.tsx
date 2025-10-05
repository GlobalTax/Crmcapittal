import { useState } from 'react';
import { usePersonalTasks } from '@/hooks/usePersonalTasks';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskInput } from '@/components/tasks/TaskInput';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { Loader2 } from 'lucide-react';

type FilterType = 'all' | 'pending' | 'completed';

export const TasksPage = () => {
  const { tasks, loading, createTask, completeTask, updateTask, deleteTask, getAllTags } = usePersonalTasks();
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const allTags = getAllTags();

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    // Filtro por estado
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    
    // Filtro por tag
    if (selectedTag && !task.tags?.includes(selectedTag)) return false;
    
    // Filtro por búsqueda
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Tareas
          </h1>
          <p className="text-muted-foreground">
            {pendingCount} pendientes · {completedCount} completadas
          </p>
        </div>

        {/* Quick Add Input */}
        <div className="mb-6">
          <TaskInput onCreateTask={createTask} allTags={allTags} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <TaskFilters
            filter={filter}
            onFilterChange={setFilter}
            selectedTag={selectedTag}
            onTagSelect={setSelectedTag}
            allTags={allTags}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            pendingCount={pendingCount}
            completedCount={completedCount}
          />
        </div>

        {/* Task List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onComplete={completeTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            allTags={allTags}
          />
        )}

        {/* Empty state */}
        {!loading && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery || selectedTag 
                ? 'No se encontraron tareas con estos filtros'
                : filter === 'completed'
                ? 'No hay tareas completadas'
                : 'No hay tareas pendientes'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
