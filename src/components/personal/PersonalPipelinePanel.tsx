import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Badge } from '@/components/ui/minimal/Badge';
import { useMiniPipeline } from '@/hooks/useMiniPipeline';
import { TrendingUp, DollarSign } from 'lucide-react';

export const PersonalPipelinePanel = () => {
  const { stages, loading } = useMiniPipeline();

  return (
    <DashboardCard title="Pipeline Mini" icon={TrendingUp}>
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-16 bg-muted rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage) => (
            <div key={stage.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">{stage.name}</h4>
                <Badge color="blue">
                  {stage.deals.length}
                </Badge>
              </div>
              
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {stage.deals.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-2">
                    No hay deals en esta etapa
                  </div>
                ) : (
                  stage.deals.slice(0, 2).map((deal) => (
                    <div 
                      key={deal.id} 
                      className="p-2 bg-accent rounded text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground truncate">
                          {deal.deal_name || 'Sin nombre'}
                        </span>
                        <div className="flex items-center gap-1 text-muted-foreground ml-2">
                          <DollarSign className="h-3 w-3" />
                          <span className="whitespace-nowrap">
                            €{deal.deal_value ? (deal.deal_value / 1000).toFixed(0) + 'K' : '0'}
                          </span>
                        </div>
                      </div>
                      {deal.company_name && (
                        <div className="text-muted-foreground mt-1 truncate">
                          {deal.company_name}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
};