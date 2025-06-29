
import { Badge } from "@/components/ui/badge";
import { ContactType } from "@/types/Contact";

interface ContactBadgesProps {
  type: ContactType;
  priority?: string;
}

export const ContactBadges = ({ type, priority }: ContactBadgesProps) => {
  const getTypeBadge = (type: ContactType) => {
    const typeConfig = {
      marketing: { label: "Marketing", color: "bg-neutral-100 text-neutral-800" },
      sales: { label: "Ventas", color: "bg-neutral-200 text-neutral-900" },
      franquicia: { label: "Franquicia", color: "bg-neutral-300 text-neutral-900" },
      cliente: { label: "Cliente", color: "bg-neutral-400 text-neutral-50" },
      prospect: { label: "Prospect", color: "bg-neutral-100 text-neutral-800" },
      other: { label: "Otro", color: "bg-neutral-100 text-neutral-800" }
    };
    
    const config = typeConfig[type];
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const priorityConfig = {
      low: { label: "Baja", color: "bg-neutral-100 text-neutral-700" },
      medium: { label: "Media", color: "bg-neutral-200 text-neutral-800" },
      high: { label: "Alta", color: "bg-neutral-800 text-neutral-50" }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    if (!config) return null;
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return {
    typeBadge: getTypeBadge(type),
    priorityBadge: getPriorityBadge(priority)
  };
};
