import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Table } from 'lucide-react';

interface DealsViewToggleProps {
  view: 'board' | 'table';
  onViewChange: (view: 'board' | 'table') => void;
}

export const DealsViewToggle = ({ view, onViewChange }: DealsViewToggleProps) => {
  return (
    <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1">
      <Button
        variant={view === 'board' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('board')}
        className={`flex items-center gap-2 transition-colors duration-200 ${
          view === 'board' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutGrid className="h-4 w-4" />
        Pipeline
      </Button>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-2 transition-colors duration-200 ${
          view === 'table' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <Table className="h-4 w-4" />
        Tabla
      </Button>
    </div>
  );
};