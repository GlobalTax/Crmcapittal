import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, User, Euro, TrendingUp, Mail, RotateCcw, Phone, MessageCircle, Smartphone, Briefcase } from 'lucide-react';
import { LeadWithStage } from '@/hooks/leads/useLeadKanban';

interface LeadKanbanCardProps {
  lead: LeadWithStage;
  onClick?: () => void;
}

export const LeadKanbanCard = ({ lead, onClick }: LeadKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Score color logic
  const getScoreColor = (score: number) => {
    if (score >= 76) return 'bg-success text-success-foreground';
    if (score >= 51) return 'bg-warning text-warning-foreground';
    if (score >= 26) return 'bg-orange-500 text-white';
    return 'bg-destructive text-destructive-foreground';
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Winback stage chip helper
  const getWinbackChip = (winbackStage: string) => {
    switch (winbackStage) {
      case 'campaign_sent':
        return {
          icon: Mail,
          label: 'Campaña enviada',
          color: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'engaging':
        return {
          icon: RotateCcw,
          label: 'En proceso',
          color: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      default:
        return null;
    }
  };

  const leadScore = lead.lead_score || 0;
  const probability = lead.prob_conversion || lead.probability || 0;
  const dealValue = lead.deal_value || lead.valor_estimado || 0;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
        isDragging ? 'opacity-50 z-50' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-3">
        {/* Lead Name */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">
                {lead.lead_name || lead.name || 'Sin nombre'}
              </h4>
            </div>
          </div>
          
          {/* Score Badge */}
          <Badge 
            variant="outline" 
            className={`text-xs ml-2 ${getScoreColor(leadScore)}`}
          >
            {leadScore}
          </Badge>
        </div>

        {/* Company */}
        {(lead.company || lead.company_name) && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {lead.company || lead.company_name}
            </span>
          </div>
        )}

        {/* Deal Value */}
        {dealValue > 0 && (
          <div className="flex items-center space-x-2">
            <Euro className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-success">
              {formatCurrency(dealValue)}
            </span>
          </div>
        )}

        {/* Probability Bar */}
        {probability > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {Math.round(probability * 100)}% probabilidad
              </span>
            </div>
            <Progress 
              value={probability * 100} 
              className="h-1.5"
            />
          </div>
        )}

        {/* Winback Status Chip */}
        {lead.winback_stage && ['campaign_sent', 'engaging'].includes(lead.winback_stage) && (
          <div className="flex items-center space-x-1">
            {(() => {
              const chipData = getWinbackChip(lead.winback_stage);
              if (!chipData) return null;
              const IconComponent = chipData.icon;
              return (
                <Badge variant="outline" className={`text-xs ${chipData.color}`}>
                  <IconComponent className="h-3 w-3 mr-1" />
                  {chipData.label}
                </Badge>
              );
            })()}
          </div>
        )}

        {/* Contact Info */}
        {lead.email && (
          <div className="text-xs text-muted-foreground truncate">
            {lead.email}
          </div>
        )}
      </CardContent>
    </Card>
  );
};