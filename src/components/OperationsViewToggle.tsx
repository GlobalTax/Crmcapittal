
import { Button } from "@/components/ui/button";

interface OperationsViewToggleProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const OperationsViewToggle = ({ viewMode, onViewModeChange }: OperationsViewToggleProps) => {
  return (
    <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={`transition-colors duration-200 ${
          viewMode === 'grid' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Cards
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className={`transition-colors duration-200 ${
          viewMode === 'table' 
            ? 'bg-gray-100 text-gray-900' 
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        Tabla
      </Button>
    </div>
  );
};
