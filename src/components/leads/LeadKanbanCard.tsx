import React, { useMemo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, User, Euro, TrendingUp } from 'lucide-react';
import { LeadWithStage } from '@/hooks/leads/useLeadKanban';

interface LeadKanbanCardProps {
  lead: LeadWithStage;
  onClick?: () => void;
}

const LeadKanbanCardComponent = ({ lead, onClick }: LeadKanbanCardProps) => {
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

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
  }), [transform, transition]);

  // Score color logic
  const getScoreColor = useCallback((score: number) => {
    if (score >= 76) return 'bg-success text-success-foreground';
    if (score >= 51) return 'bg-warning text-warning-foreground';
    if (score >= 26) return 'bg-orange-500 text-white';
    return 'bg-destructive text-destructive-foreground';
  }, []);

  // Format currency
  const formatCurrency = useCallback((value?: number) => {
    if (!value) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const leadScore = useMemo(() => lead.lead_score || 0, [lead.lead_score]);
  const probability = useMemo(() => lead.prob_conversion || lead.probability || 0, [lead.prob_conversion, lead.probability]);
  const dealValue = useMemo(() => lead.deal_value || lead.valor_estimado || 0, [lead.deal_value, lead.valor_estimado]);
  const companyName = useMemo(() => lead.company || lead.company_name, [lead.company, lead.company_name]);
  const leadName = useMemo(() => lead.lead_name || lead.name || 'Sin nombre', [lead.lead_name, lead.name]);
  
  const formattedCurrency = useMemo(() => formatCurrency(dealValue), [dealValue, formatCurrency]);
  const scoreColorClass = useMemo(() => getScoreColor(leadScore), [leadScore, getScoreColor]);
  const probabilityPercentage = useMemo(() => Math.round(probability * 100), [probability]);


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
                {leadName}
              </h4>
            </div>
          </div>
          
          {/* Score Badge */}
          <Badge 
            variant="outline" 
            className={`text-xs ml-2 ${scoreColorClass}`}
          >
            {leadScore}
          </Badge>
        </div>

        {/* Company */}
        {companyName && (
          <div className="flex items-center space-x-2">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground truncate">
              {companyName}
            </span>
          </div>
        )}

        {/* Deal Value */}
        {dealValue > 0 && (
          <div className="flex items-center space-x-2">
            <Euro className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-success">
              {formattedCurrency}
            </span>
          </div>
        )}

        {/* Probability Bar */}
        {probability > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {probabilityPercentage}% probabilidad
              </span>
            </div>
            <Progress 
              value={probability * 100} 
              className="h-1.5"
            />
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

export const LeadKanbanCard = React.memo(LeadKanbanCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.lead.id === nextProps.lead.id &&
    prevProps.lead.lead_score === nextProps.lead.lead_score &&
    prevProps.lead.prob_conversion === nextProps.lead.prob_conversion &&
    prevProps.lead.deal_value === nextProps.lead.deal_value &&
    prevProps.lead.updated_at === nextProps.lead.updated_at
  );
});