import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PaginationConfig } from '@/types/common';

interface PaginationControlsProps {
  config: PaginationConfig;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

export const PaginationControls = ({ 
  config, 
  onPageChange, 
  onNextPage, 
  onPreviousPage 
}: PaginationControlsProps) => {
  if (config.totalPages <= 1) return null;

  const { page, totalPages, totalItems, pageSize } = config;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          className="min-w-10"
        >
          {i}
        </Button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <div className="text-sm text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} operaciones
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {renderPageButtons()}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
