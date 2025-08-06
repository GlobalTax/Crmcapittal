
import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, User, Euro, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lead } from '@/types/Lead';
import { cn } from '@/lib/utils';

interface SummarySectionProps {
  lead: Lead;
}

export const SummarySection = ({ lead }: SummarySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProbabilityColor = (probability?: number) => {
    if (!probability) return 'text-gray-500';
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-blue-600';
    if (probability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            RESUMEN
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "h-6 w-6 p-0 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        <div className={cn(
          "space-y-4 transition-all duration-300 overflow-hidden",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}>
          {/* Deal Value with Progress */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
              <Euro className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold text-green-700">
                {formatCurrency(lead.deal_value)}
              </div>
              <div className="text-xs text-green-600 mb-2">
                Valor del deal
              </div>
              {lead.probability && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Probabilidad</span>
                    <span className={getProbabilityColor(lead.probability)}>
                      {lead.probability}%
                    </span>
                  </div>
                  <Progress value={lead.probability} className="h-2" />
                </div>
              )}
            </div>
          </div>

          {/* Organization */}
          {lead.company_name && (
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-foreground">{lead.company_name}</div>
                <div className="text-xs text-muted-foreground">
                  Organización
                </div>
              </div>
            </div>
          )}

          {/* Person */}
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">{lead.name}</div>
              <div className="text-sm text-muted-foreground mb-1">
                {lead.email}
              </div>
              {lead.phone && (
                <div className="text-sm text-muted-foreground">
                  {lead.phone}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Contacto principal
              </div>
            </div>
          </div>

          {/* Lead Score */}
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  {lead.lead_score || 0}
                </span>
                <Badge variant="secondary" className="text-xs">
                  Score
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Puntuación del lead
              </div>
            </div>
          </div>

          {/* Expected Close Date */}
          {lead.estimated_close_date && (
            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Fecha de cierre esperada:</span>
              </div>
              <div className="font-semibold text-foreground mt-1">
                {new Date(lead.estimated_close_date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="text-xs">
              {lead.status}
            </Badge>
            {lead.priority && (
              <Badge 
                variant={lead.priority === 'HIGH' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {lead.priority}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs capitalize">
              {lead.source?.replace('_', ' ') || 'Sin origen'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
