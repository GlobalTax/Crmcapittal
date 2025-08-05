/**
 * Operation Card Content Component
 */

import React from 'react';
import { Operation } from '../types';

interface OperationCardContentProps {
  operation: Operation;
}

export const OperationCardContent: React.FC<OperationCardContentProps> = ({ operation }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Valor:</span>
        <span className="font-medium">
          {operation.amount ? `€${(operation.amount / 1000000).toFixed(1)}M` : 'N/A'}
        </span>
      </div>
      
      {operation.location && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Ubicación:</span>
          <span className="text-sm">{operation.location}</span>
        </div>
      )}
      
      {operation.description && (
        <div className="mt-2">
          <p className="text-sm text-gray-700 line-clamp-2">
            {operation.description}
          </p>
        </div>
      )}
    </div>
  );
};