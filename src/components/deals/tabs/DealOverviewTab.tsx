import React from 'react';
import { Deal } from '@/types/Deal';
import { DealHighlightCard } from '../DealHighlightCard';
import { DealProgressBar } from '../DealProgressBar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Euro, User, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface DealOverviewTabProps {
  deal: Deal;
}

export const DealOverviewTab = ({ deal }: DealOverviewTabProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No amount set';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount > 999999 ? 'compact' : 'standard'
    }).format(amount);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Lead': '#1E88E5',
      'In Progress': '#FFB300',
      'Won': '#00C48C',
      'Lost': '#EF5350'
    };
    return colors[stage] || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {/* Highlights Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        <DealHighlightCard
          title="Deal Stage"
          icon={TrendingUp}
          value={
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getStageColor(deal.stage) }}
                />
                <Badge variant="secondary" className="text-xs">
                  {deal.stage}
                </Badge>
              </div>
              <DealProgressBar stage={deal.stage} />
            </div>
          }
          subtitle={`${deal.probability}% probability`}
        />

        <DealHighlightCard
          title="Deal Value"
          icon={Euro}
          value={
            <span className="text-success font-semibold">
              {formatCurrency(deal.amount)}
            </span>
          }
        />

        <DealHighlightCard
          title="Deal Owner"
          icon={User}
          value={
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-muted">
                  {deal.owner?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{deal.owner?.name || 'Unassigned'}</span>
            </div>
          }
          subtitle={deal.owner?.email}
        />
      </div>

      {/* Additional Cards */}
      <div className="grid grid-cols-2 gap-4">
        <DealHighlightCard
          title="Next Due Task"
          icon={Calendar}
          value="No tasks scheduled"
          subtitle="Create a task to track progress"
        />

        <DealHighlightCard
          title="Last Interaction"
          icon={MessageSquare}
          value="No interactions yet"
          subtitle="Log an interaction to build the timeline"
        />
      </div>

      {/* Recent Activity Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground">
            Activities will appear here as you interact with this deal
          </p>
        </div>
      </div>
    </div>
  );
};