import { Button } from '@/components/ui/button';
import { Table, Kanban } from 'lucide-react';

type ViewType = 'table' | 'pipeline';

interface PipelineViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const PipelineViewToggle = ({ currentView, onViewChange }: PipelineViewToggleProps) => {
  return (
    <div className="flex items-center space-x-1 border rounded-lg p-1">
      <Button
        variant={currentView === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('table')}
        className="flex items-center space-x-2"
      >
        <Table className="h-4 w-4" />
        <span>Tabla</span>
      </Button>
      <Button
        variant={currentView === 'pipeline' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('pipeline')}
        className="flex items-center space-x-2"
      >
        <Kanban className="h-4 w-4" />
        <span>Pipeline</span>
      </Button>
    </div>
  );
};