import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMiniPipeline } from '@/hooks/useMiniPipeline';
import { TrendingUp, DollarSign } from 'lucide-react';

interface PanelPipelineMiniProps {
  className?: string;
}

export const PanelPipelineMini = ({ className }: PanelPipelineMiniProps) => {
  const { stages, loading } = useMiniPipeline();

  const stageColors = {
    'Lead': 'bg-blue-100 text-blue-800',
    'Qualifying': 'bg-yellow-100 text-yellow-800',
    'Proposal': 'bg-green-100 text-green-800'
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="section-title flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Pipeline Mini
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  <Badge 
                    className={stageColors[stage.name as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}
                  >
                    {stage.deals.length}
                  </Badge>
                </div>
                
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {stage.deals.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      No hay deals en esta etapa
                    </div>
                  ) : (
                    stage.deals.slice(0, 3).map((deal) => (
                      <div 
                        key={deal.id} 
                        className="p-2 bg-accent/30 rounded text-xs hover:bg-accent/50 transition-colors"
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
                  
                  {stage.deals.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{stage.deals.length - 3} más
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};