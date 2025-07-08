import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, Kanban } from 'lucide-react';

interface NegociosViewToggleProps {
  currentView: 'table' | 'kanban';
  onViewChange: (view: 'table' | 'kanban') => void;
}

export const NegociosViewToggle = ({ currentView, onViewChange }: NegociosViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="gap-2"
      >
        <Table className="h-4 w-4" />
        Tabla
      </Button>
      <Button
        variant={currentView === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
        className="gap-2"
      >
        <Kanban className="h-4 w-4" />
        Pipeline
      </Button>
    </div>
  );};
