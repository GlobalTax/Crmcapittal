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
    <div className="flex border border-gray-200 rounded-lg">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={`rounded-r-none border-r transition-colors duration-200 ${
          viewMode === 'grid' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Tarjetas</span>
      </Button>
      
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={`rounded-none border-r transition-colors duration-200 ${
          viewMode === 'list' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <List className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Lista</span>
      </Button>
      
      <Button
        variant={viewMode === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('kanban')}
        className={`rounded-l-none transition-colors duration-200 ${
          viewMode === 'kanban' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Kanban className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Kanban</span>
      </Button>
    </div>
  );
}