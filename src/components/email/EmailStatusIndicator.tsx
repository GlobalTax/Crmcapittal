import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailStatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const EmailStatusIndicator: React.FC<EmailStatusIndicatorProps> = ({
  status,
  size = 'md',
  showText = true
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SENT':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-blue-500',
          text: 'Enviado',
          badgeVariant: 'secondary' as const
        };
      case 'OPENED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-green-500',
          text: 'Abierto',
          badgeVariant: 'default' as const
        };
      case 'CLICKED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          color: 'bg-green-600',
          text: 'Clicked',
          badgeVariant: 'default' as const
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'bg-gray-500',
          text: 'Desconocido',
          badgeVariant: 'outline' as const
        };
    }
  };

  const config = getStatusConfig(status);

  if (!showText) {
    return (
      <div className={cn(
        "rounded-full flex items-center justify-center text-white",
        config.color,
        size === 'sm' && "w-6 h-6",
        size === 'md' && "w-8 h-8",
        size === 'lg' && "w-10 h-10"
      )}>
        {React.cloneElement(config.icon, {
          className: cn(
            size === 'sm' && "h-3 w-3",
            size === 'md' && "h-4 w-4",
            size === 'lg' && "h-5 w-5"
          )
        })}
      </div>
    );
  }

  return (
    <Badge variant={config.badgeVariant} className="flex items-center gap-1">
      {React.cloneElement(config.icon, {
        className: "h-3 w-3"
      })}
      {config.text}
    </Badge>
  );
};