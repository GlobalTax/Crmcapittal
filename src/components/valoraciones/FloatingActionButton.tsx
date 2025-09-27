import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NewValoracionDialog } from './NewValoracionDialog';

interface FloatingActionButtonProps {
  onSuccess?: () => void;
}

export const FloatingActionButton = ({ onSuccess }: FloatingActionButtonProps) => {
  return (
    <div className="app-fab-in-main bottom-6 right-6">
      <NewValoracionDialog onSuccess={onSuccess}>
        <Button 
          size="lg" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-6 h-6" />
          <span className="sr-only">Nueva Valoración</span>
        </Button>
      </NewValoracionDialog>
    </div>
  );
};