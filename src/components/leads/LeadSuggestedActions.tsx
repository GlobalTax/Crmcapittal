import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Phone, 
  Mail, 
  CheckCircle, 
  Users, 
  MessageSquare,
  Star,
  Clock
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types/Lead';

interface LeadSuggestedActionsProps {
  lead: Lead;
  onAssign: (leadId: string, userId: string) => void;
  onConvert: (leadId: string, options: { createCompany: boolean; createDeal: boolean }) => void;
  onDelete: (leadId: string) => void;
  className?: string;
}

const getSuggestedActions = (status: LeadStatus) => {
  switch (status) {
    case 'NEW':
      return [
        { action: 'assign', label: 'Asignar', icon: UserPlus, variant: 'default' as const, priority: 1 },
        { action: 'contact', label: 'Contactar', icon: Phone, variant: 'outline' as const, priority: 2 }
      ];
    case 'CONTACTED':
      return [
        { action: 'qualify', label: 'Calificar', icon: Star, variant: 'default' as const, priority: 1 },
        { action: 'followup', label: 'Seguimiento', icon: Clock, variant: 'outline' as const, priority: 2 }
      ];
    case 'QUALIFIED':
      return [
        { action: 'convert', label: 'Convertir', icon: CheckCircle, variant: 'default' as const, priority: 1 },
        { action: 'nurture', label: 'Nutrir', icon: MessageSquare, variant: 'outline' as const, priority: 2 }
      ];
    case 'NURTURING':
      return [
        { action: 'convert', label: 'Convertir', icon: CheckCircle, variant: 'default' as const, priority: 1 },
        { action: 'schedule', label: 'Agendar', icon: Clock, variant: 'outline' as const, priority: 2 }
      ];
    case 'CONVERTED':
      return [
        { action: 'manage', label: 'Gestionar', icon: Users, variant: 'outline' as const, priority: 1 }
      ];
    default:
      return [];
  }
};

const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'NEW': return 'bg-blue-100 text-blue-800';
    case 'CONTACTED': return 'bg-yellow-100 text-yellow-800';
    case 'QUALIFIED': return 'bg-green-100 text-green-800';
    case 'NURTURING': return 'bg-purple-100 text-purple-800';
    case 'CONVERTED': return 'bg-emerald-100 text-emerald-800';
    case 'LOST': return 'bg-red-100 text-red-800';
    case 'DISQUALIFIED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const LeadSuggestedActions = ({ 
  lead, 
  onAssign, 
  onConvert, 
  onDelete,
  className = "" 
}: LeadSuggestedActionsProps) => {
  const suggestedActions = getSuggestedActions(lead.status);
  
  const handleAction = (action: string) => {
    switch (action) {
      case 'assign':
        // For demo, assign to current user - in real app, show user selector
        onAssign(lead.id, 'current-user');
        break;
      case 'convert':
        onConvert(lead.id, { createCompany: true, createDeal: true });
        break;
      case 'contact':
        window.open(`mailto:${lead.email}`, '_blank');
        break;
      case 'qualify':
        // In real app, this would update status to QUALIFIED
        console.log('Qualifying lead:', lead.id);
        break;
      default:
        console.log(`Action ${action} for lead:`, lead.id);
    }
  };

  return (
    <div className={`space-y-3 ${className}`} data-tour="suggested-actions">
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(lead.status)}>
          {lead.status}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Score: {lead.lead_score}
        </span>
      </div>
      
      {suggestedActions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Acciones sugeridas:
          </p>
          <div className="flex flex-wrap gap-1">
            {suggestedActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.action}
                  variant={action.variant}
                  size="sm"
                  className="h-7 text-xs animate-fade-in"
                  onClick={() => handleAction(action.action)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};