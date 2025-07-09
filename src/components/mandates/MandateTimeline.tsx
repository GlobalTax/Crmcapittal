import { Badge } from '@/components/ui/badge';
import { BuyingMandate } from '@/types/BuyingMandate';

interface MandateTimelineProps {
  startDate: string;
  endDate?: string;
  createdAt: string;
  status: BuyingMandate['status'];
  showTitle?: boolean;
  className?: string;
}

export const MandateTimeline = ({ 
  startDate, 
  endDate, 
  createdAt, 
  status,
  showTitle = true, 
  className = "" 
}: MandateTimelineProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusBadge = (status: BuyingMandate['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className={className}>
      {showTitle && <h4 className="font-medium mb-2">Timeline</h4>}
      <div className="space-y-1 text-sm">
        <div>Inicio: {formatDate(startDate)}</div>
        {endDate && (
          <div>Fin estimado: {formatDate(endDate)}</div>
        )}
        <div className="text-muted-foreground">
          Mandato iniciado: {formatDate(createdAt)}
        </div>
        <div className="mt-2">
          {getStatusBadge(status)}
        </div>
      </div>
    </div>
  );
};