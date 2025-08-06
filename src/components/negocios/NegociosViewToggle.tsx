import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, Kanban } from 'lucide-react';

interface NegociosViewToggleProps {
  currentView: 'table' | 'kanban';
  onViewChange: (view: 'table' | 'kanban') => void;
}

export const NegociosViewToggle = ({ currentView, onViewChange }: NegociosViewToggleProps) => {
  return (
    <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1">
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className={`gap-2 transition-colors duration-200 ${
          currentView === 'table' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Table className="h-4 w-4" />
        Tabla
      </Button>
      <Button
        variant={currentView === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
        className={`gap-2 transition-colors duration-200 ${
          currentView === 'kanban' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Kanban className="h-4 w-4" />
        Pipeline
      </Button>
    </div>
  );
};