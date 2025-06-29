
import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@/types/Lead";

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

const statusConfig = {
  NEW: {
    label: 'Nuevo',
    variant: 'secondary' as const,
    className: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-100'
  },
  CONTACTED: {
    label: 'Contactado',
    variant: 'secondary' as const,
    className: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-200'
  },
  QUALIFIED: {
    label: 'Calificado',
    variant: 'secondary' as const,
    className: 'bg-neutral-300 text-neutral-900 hover:bg-neutral-300'
  },
  DISQUALIFIED: {
    label: 'Descalificado',
    variant: 'secondary' as const,
    className: 'bg-neutral-800 text-neutral-50 hover:bg-neutral-800'
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
