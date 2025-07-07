import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MandateTarget } from '@/types/BuyingMandate';

interface TargetProgressBarProps {
  status: MandateTarget['status'];
  contacted: boolean;
  className?: string;
}

export const TargetProgressBar = ({ status, contacted, className = "" }: TargetProgressBarProps) => {
  const getProgressData = (status: MandateTarget['status'], contacted: boolean) => {
    const statusProgressMap = {
      pending: { progress: 10, color: 'bg-muted', label: 'Pendiente' },
      contacted: { progress: 30, color: 'bg-blue-500', label: 'Contactado' },
      in_analysis: { progress: 50, color: 'bg-yellow-500', label: 'En Análisis' },
      interested: { progress: 70, color: 'bg-green-500', label: 'Interesado' },
      nda_signed: { progress: 85, color: 'bg-green-600', label: 'NDA Firmado' },
      rejected: { progress: 100, color: 'bg-red-500', label: 'Rechazado' },
      closed: { progress: 100, color: 'bg-gray-500', label: 'Cerrado' },
    };

    return statusProgressMap[status] || statusProgressMap.pending;
  };

  const getStatusBadge = (status: MandateTarget['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      contacted: { label: 'Contactado', variant: 'default' as const },
      in_analysis: { label: 'En Análisis', variant: 'outline' as const },
      interested: { label: 'Interesado', variant: 'default' as const },
      nda_signed: { label: 'NDA Firmado', variant: 'default' as const },
      rejected: { label: 'Rechazado', variant: 'destructive' as const },
      closed: { label: 'Cerrado', variant: 'outline' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const progressData = getProgressData(status, contacted);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {getStatusBadge(status)}
        <span className="text-xs text-muted-foreground">
          {progressData.progress}%
        </span>
      </div>
      <Progress 
        value={progressData.progress} 
        className="h-2"
      />
      {contacted && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-green-600">Contactado</span>
        </div>
      )}
    </div>
  );
};