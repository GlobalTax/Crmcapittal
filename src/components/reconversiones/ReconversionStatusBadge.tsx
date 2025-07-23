
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ReconversionStatus = 'draft' | 'active' | 'matching' | 'closed' | 'rejected' | 'paused';

interface ReconversionStatusBadgeProps {
  status: ReconversionStatus;
  priority?: any; // Acepta cualquier prioridad para compatibilidad
  className?: string;
}

const statusConfig = {
  draft: {
    label: 'Borrador',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  },
  active: {
    label: 'Activa',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  },
  matching: {
    label: 'En Matching',
    variant: 'outline' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100'
  },
  closed: {
    label: 'Cerrada',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  rejected: {
    label: 'Rechazada',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-100'
  },
  paused: {
    label: 'Pausada',
    variant: 'secondary' as const,
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100'
  }
};

export function ReconversionStatusBadge({ status, priority, className }: ReconversionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
