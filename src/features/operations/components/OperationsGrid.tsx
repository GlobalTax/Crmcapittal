/**
 * Operations Grid Component
 */

import React from 'react';
import { Operation } from '../types';
import { OperationCard } from './OperationCard';

interface OperationsGridProps {
  operations: Operation[];
  onToggleFavorite?: (operationId: string) => void;
  isFavorite?: (operationId: string) => boolean;
}

export const OperationsGrid: React.FC<OperationsGridProps> = ({ operations }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {operations.map((operation) => (
        <OperationCard key={operation.id} operation={operation} />
      ))}
    </div>
  );
};