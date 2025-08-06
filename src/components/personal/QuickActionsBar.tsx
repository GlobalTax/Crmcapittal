import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, UserPlus } from 'lucide-react';

interface QuickActionsBarProps {
  onNewTask?: () => void;
  onNewLead?: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onNewTask,
  onNewLead
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewTask}
        className="text-gray-600 hover:text-gray-900"
      >
        <Plus className="w-4 h-4 mr-1" />
        Nueva tarea
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onNewLead}
        className="text-gray-600 hover:text-gray-900"
      >
        <UserPlus className="w-4 h-4 mr-1" />
        Nuevo lead
      </Button>
    </div>
  );
};