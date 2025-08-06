import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { NewValoracionDialog } from './NewValoracionDialog';
import { ValoracionesViewToggle } from './ValoracionesViewToggle';

interface ValoracionesHeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  viewMode: 'list' | 'kanban';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
  onNewValoracionSuccess: () => void;
}

export const ValoracionesHeader = ({
  onRefresh,
  isLoading,
  viewMode,
  onViewModeChange,
  onNewValoracionSuccess
}: ValoracionesHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">
            Valoraciones
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Gestiona y consulta las valoraciones de empresas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <NewValoracionDialog onSuccess={onNewValoracionSuccess} />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <ValoracionesViewToggle 
            viewMode={viewMode} 
            onViewModeChange={onViewModeChange} 
          />
        </div>
      </div>
    </div>
  );
};