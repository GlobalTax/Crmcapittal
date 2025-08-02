import { Badge } from '@/components/ui/badge';

interface WinbackStatusBadgeProps {
  stage: string;
  className?: string;
}

export const WinbackStatusBadge = ({ stage, className }: WinbackStatusBadgeProps) => {
  const getWinbackStageConfig = (stage: string) => {
    switch (stage) {
      case 'cold':
        return {
          variant: 'secondary' as const,
          label: 'Sin Contactar',
          className: 'bg-slate-100 text-slate-700'
        };
      case 'campaign_sent':
        return {
          variant: 'default' as const,
          label: 'En Proceso',
          className: 'bg-blue-100 text-blue-700'
        };
      case 'engaging':
        return {
          variant: 'outline' as const,
          label: 'Respondiendo',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-300'
        };
      case 'reopened':
        return {
          variant: 'default' as const,
          label: 'Reabierto',
          className: 'bg-green-100 text-green-700'
        };
      case 'irrecuperable':
        return {
          variant: 'destructive' as const,
          label: 'Irrecuperable',
          className: 'bg-red-100 text-red-700'
        };
      default:
        return {
          variant: 'secondary' as const,
          label: 'Sin Estado',
          className: 'bg-gray-100 text-gray-700'
        };
    }
  };

  const config = getWinbackStageConfig(stage);

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className}`}
    >
      {config.label}
    </Badge>
  );
};