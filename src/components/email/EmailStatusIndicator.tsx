
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MailOpen, 
  MousePointer, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { EmailStatus } from '@/types/EmailTracking';
import { cn } from '@/lib/utils';

interface EmailStatusIndicatorProps {
  status: EmailStatus;
  openedAt?: string;
  openCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const EmailStatusIndicator: React.FC<EmailStatusIndicatorProps> = ({
  status,
  openedAt,
  openCount = 0,
  size = 'md',
  showText = true
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'SENT':
        return {
          icon: Mail,
          text: 'Enviado',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600'
        };
      case 'OPENED':
        return {
          icon: MailOpen,
          text: 'Abierto',
          color: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600'
        };
      case 'CLICKED':
        return {
          icon: MousePointer,
          text: 'Clic',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Desconocido',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1.5',
    lg: 'text-base px-3 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (!showText) {
    return (
      <div className={cn(
        "inline-flex items-center justify-center rounded-full border",
        config.color,
        size === 'sm' ? 'p-1' : size === 'md' ? 'p-1.5' : 'p-2'
      )}>
        <Icon className={cn(iconSizes[size], config.iconColor)} />
      </div>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "inline-flex items-center gap-1.5 border",
        config.color,
        sizeClasses[size]
      )}
    >
      <Icon className={cn(iconSizes[size], config.iconColor)} />
      <span>{config.text}</span>
      {status === 'OPENED' && openCount > 1 && (
        <span className="text-xs opacity-75">
          ({openCount}x)
        </span>
      )}
    </Badge>
  );
};
