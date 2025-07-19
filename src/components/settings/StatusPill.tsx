import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatusPillProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

const variantStyles = {
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200'
};

export const StatusPill = ({ status, variant = 'success' }: StatusPillProps) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
      variantStyles[variant]
    )}>
      {status}
    </span>
  );
};