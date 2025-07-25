import React from 'react';
import { Button } from '@/components/ui/button';
import { List, LayoutGrid } from 'lucide-react';

type ViewMode = 'list' | 'kanban';

interface ValoracionesViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ValoracionesViewToggle = ({ viewMode, onViewModeChange }: ValoracionesViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="gap-2"
      >
        <List className="w-4 h-4" />
        Lista
      </Button>
      <Button
        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('kanban')}
        className="gap-2"
      >
        <LayoutGrid className="w-4 h-4" />
        Kanban
      </Button>
    </div>
  );
};