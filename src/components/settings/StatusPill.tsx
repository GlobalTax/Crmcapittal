
import { Badge } from '@/components/ui/badge';

interface StatusPillProps {
  status: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
}

export const StatusPill = ({ status, variant = 'info' }: StatusPillProps) => {
  const variants = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <Badge className={variants[variant]}>
      {status}
    </Badge>
  );
};
