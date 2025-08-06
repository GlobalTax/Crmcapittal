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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Valoraciones
        </h1>
        <p className="text-muted-foreground">
          Gestiona y consulta las valoraciones de empresas
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <NewValoracionDialog onSuccess={onNewValoracionSuccess} />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
        <ValoracionesViewToggle 
          viewMode={viewMode} 
          onViewModeChange={onViewModeChange} 
        />
      </div>
    </div>
  );
};