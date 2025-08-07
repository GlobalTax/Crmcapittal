import React from 'react';
import { AnimatedCard, AnimatedCardContent } from '@/components/ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { 
  Building, 
  User, 
  Euro, 
  Calendar,
  Eye,
  Edit
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];

interface MobileReconversionCardProps {
  reconversion: Reconversion;
  onSelect: () => void;
}

export function MobileReconversionCard({ reconversion, onSelect }: MobileReconversionCardProps) {
  const { hasPermission, canViewSensitiveData, maskSensitiveData } = useReconversionSecurity();
  const canRead = hasPermission(reconversion, 'read');
  const canViewSensitive = canViewSensitiveData(reconversion);

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const priorityLabels = {
      urgent: 'Urgente',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja'
    };
    return priorityLabels[priority as keyof typeof priorityLabels] || 'Media';
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return undefined;
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(0)}K`;
    }
    return `€${value}`;
  };

  const formatInvestmentRange = (min?: number, max?: number) => {
    if (!min && !max) return 'No especificado';
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return `Desde ${formatCurrency(min)}`;
    if (max) return `Hasta ${formatCurrency(max)}`;
    return 'No especificado';
  };

  if (!canRead) {
    return null;
  }

  return (
    <AnimatedCard 
      className="w-full cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
      onClick={onSelect}
      hover={true}
      clickable={true}
    >
      <AnimatedCardContent className="p-4 space-y-3">
        {/* Header with company name and status */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate">
              {reconversion.company_name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">
                {canViewSensitive ? reconversion.contact_name : maskSensitiveData(reconversion.contact_name || '')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <ReconversionStatusBadge status={reconversion.status as any} />
          </div>
        </div>

        {/* Investment capacity */}
        <div className="flex items-center gap-2">
          <Euro className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium text-foreground">
            {formatInvestmentRange(
              reconversion.investment_capacity_min || undefined, 
              reconversion.investment_capacity_max || undefined
            )}
          </span>
        </div>

        {/* Priority and sectors */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={getPriorityVariant((reconversion as any).priority || 'medium')}
            className="text-xs"
          >
            {getPriorityLabel((reconversion as any).priority || 'medium')}
          </Badge>
          
          {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {reconversion.target_sectors.length === 1 
                ? '1 sector'
                : `${reconversion.target_sectors.length} sectores`
              }
            </span>
          )}
        </div>

        {/* Footer with date and actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(reconversion.created_at), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
          </div>
          
          <div className="flex gap-2">
            <LoadingButton
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              <Eye className="h-4 w-4" />
            </LoadingButton>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}