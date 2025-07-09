import { Badge } from '@/components/ui/badge';
import { ContactRole } from '@/types/Contact';

interface ContactRoleBadgesProps {
  roles?: ContactRole[];
  maxDisplay?: number;
  className?: string;
}

const roleLabels: Record<ContactRole, string> = {
  owner: 'Propietario',
  buyer: 'Comprador',
  advisor: 'Asesor',
  investor: 'Inversor',
  target: 'Target',
  client: 'Cliente',
  prospect: 'Prospecto',
  lead: 'Lead',
  other: 'Otro'
};

const roleColors: Record<ContactRole, string> = {
  owner: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  buyer: 'bg-green-100 text-green-800 hover:bg-green-200',
  advisor: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  investor: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  target: 'bg-red-100 text-red-800 hover:bg-red-200',
  client: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  prospect: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  lead: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
  other: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

export const ContactRoleBadges = ({ roles = [], maxDisplay = 3, className }: ContactRoleBadgesProps) => {
  if (!roles || roles.length === 0) {
    return <span className="text-muted-foreground text-sm">Sin roles</span>;
  }

  const displayRoles = roles.slice(0, maxDisplay);
  const remainingCount = roles.length - maxDisplay;

  return (
    <div className={`flex gap-1 flex-wrap ${className}`}>
      {displayRoles.map((role, index) => (
        <Badge 
          key={`${role}-${index}`} 
          variant="secondary"
          className={`text-xs ${roleColors[role]}`}
        >
          {roleLabels[role]}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
};