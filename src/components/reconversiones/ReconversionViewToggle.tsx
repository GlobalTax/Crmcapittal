import React from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List, Kanban } from 'lucide-react';

interface ReconversionViewToggleProps {
  viewMode: 'grid' | 'list' | 'kanban';
  onViewModeChange: (mode: 'grid' | 'list' | 'kanban') => void;
}

export function ReconversionViewToggle({ 
  viewMode, 
  onViewModeChange 
}: ReconversionViewToggleProps) {
  return (
    <div className="flex border rounded-md">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="rounded-r-none border-r"
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Tarjetas</span>
      </Button>
      
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="rounded-none border-r"
      >
        <List className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Lista</span>
      </Button>
      
      <Button
        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('kanban')}
        className="rounded-l-none"
      >
        <Kanban className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Kanban</span>
      </Button>
    </div>
  );
}