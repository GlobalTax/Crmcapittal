import { Badge } from '@/components/ui/badge';
import { ContactStatus } from '@/types/Contact';
import { Circle, Ban, Archive } from 'lucide-react';

interface ContactStatusBadgeProps {
  status?: ContactStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Activo',
    icon: Circle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  blocked: {
    label: 'Bloqueado',
    icon: Ban,
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  archived: {
    label: 'Archivado',
    icon: Archive,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
};

export const ContactStatusBadge = ({ 
  status = 'active', 
  showIcon = true, 
  className 
}: ContactStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`text-xs ${config.className} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
};