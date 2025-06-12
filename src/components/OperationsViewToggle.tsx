
import { Button } from "@/components/ui/button";
import { Grid, Table } from "lucide-react";

interface OperationsViewToggleProps {
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const OperationsViewToggle = ({ viewMode, onViewModeChange }: OperationsViewToggleProps) => {
  return (
    <div className="flex items-center space-x-2 bg-white rounded-[10px] p-1" style={{ border: '0.5px solid black' }}>
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
        <Grid className="h-4 w-4 mr-2" />
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
        <Table className="h-4 w-4 mr-2" />
        Tabla
      </Button>
    </div>
  );
};
