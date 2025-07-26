import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  User, 
  Euro, 
  Target, 
  MapPin, 
  Calendar,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReconversionSecurity } from '@/hooks/useReconversionSecurity';
import { ReconversionStatusBadge } from './ReconversionStatusBadge';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones']['Row'];

interface ReconversionCardProps {
  reconversion: Reconversion;
  onSelect: () => void;
}

export function ReconversionCard({ reconversion, onSelect }: ReconversionCardProps) {
  const { hasPermission, canViewSensitiveData, maskSensitiveData } = useReconversionSecurity();
  const canRead = hasPermission(reconversion, 'read');
  const canViewSensitive = canViewSensitiveData(reconversion);

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
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
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatInvestmentRange = (min?: number, max?: number) => {
    if (!min && !max) return 'Capacidad no especificada';
    if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`;
    if (min) return `Desde ${formatCurrency(min)}`;
    if (max) return `Hasta ${formatCurrency(max)}`;
    return 'Capacidad no especificada';
  };

  if (!canRead) {
    return null;
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary group"
      onClick={onSelect}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-1 group-hover:text-primary transition-colors">
              {reconversion.company_name}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">
                {canViewSensitive ? reconversion.contact_name : maskSensitiveData(reconversion.contact_name || '')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4">
            <ReconversionStatusBadge status={reconversion.status as any} />
            <Badge 
              variant={getPriorityVariant((reconversion as any).priority || 'medium')}
              className="text-xs"
            >
              {getPriorityLabel((reconversion as any).priority || 'medium')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment Capacity */}
        <div className="flex items-center gap-2 text-sm">
          <Euro className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground">
            {formatInvestmentRange(
              reconversion.investment_capacity_min || undefined, 
              reconversion.investment_capacity_max || undefined
            )}
          </span>
        </div>

        {/* Target Sectors */}
        {reconversion.target_sectors && reconversion.target_sectors.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">
              {reconversion.target_sectors.length === 1 
                ? '1 sector objetivo'
                : `${reconversion.target_sectors.length} sectores objetivo`
              }
            </span>
          </div>
        )}

        {/* Notes */}
        {reconversion.notes && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">
              {reconversion.notes.substring(0, 50)}...
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(reconversion.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </p>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Eye className="h-4 w-4" />
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}