/**
 * Operation Card Header Component
 */

import React from 'react';
import { Badge } from '@/shared/components/ui';
import { Operation } from '../types';
import { getStatusColor, getStatusLabel } from '@/shared/utils';

interface OperationCardHeaderProps {
  operation: Operation;
}

export const OperationCardHeader: React.FC<OperationCardHeaderProps> = ({ operation }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <div>
          <h3 className="font-semibold text-black text-base">{operation.company_name}</h3>
          <p className="text-black text-xs">{operation.sector}</p>
        </div>
      </div>
      <Badge className={getStatusColor(operation.status)}>
        {getStatusLabel(operation.status)}
      </Badge>
    </div>
  );
};