import React from 'react';
import { Button } from '@/components/ui/button';

interface LoadMoreButtonProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
}

export const LoadMoreButton = ({ onLoadMore, hasMore, isLoading }: LoadMoreButtonProps) => {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center pt-6">
      <Button
        variant="outline"
        onClick={onLoadMore}
        disabled={isLoading}
        className="px-8"
      >
        {isLoading ? 'Cargando...' : 'Mostrar 50 más'}
      </Button>
    </div>
  );
};