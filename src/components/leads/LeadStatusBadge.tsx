
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@/types/Lead";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusConfig = {
  NEW: {
    label: 'Nuevo',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
  },
  CONTACTED: {
    label: 'Contactado',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  },
  QUALIFIED: {
    label: 'Calificado',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-100'
  },
  DISQUALIFIED: {
    label: 'Descalificado',
    variant: 'secondary' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-100'
  }
};

export const LeadStatusBadge = ({ status }: LeadStatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
