
import { Button } from "@/components/ui/button";

interface OperationsViewToggleProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const OperationsViewToggle = ({ viewMode, onViewModeChange }: OperationsViewToggleProps) => {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg p-1" style={{ border: '0.5px solid black' }}>
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={`${
          viewMode === 'grid' 
            ? 'bg-black text-white hover:bg-gray-800' 
            : 'text-black hover:bg-gray-100'
        }`}
      >
        Cards
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className={`${
          viewMode === 'table' 
            ? 'bg-black text-white hover:bg-gray-800' 
            : 'text-black hover:bg-gray-100'
        }`}
      >
        Tabla
      </Button>
    </div>
  );
};
