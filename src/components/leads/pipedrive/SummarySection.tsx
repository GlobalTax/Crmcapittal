
import { useState } from 'react';
import { ChevronDown, ChevronUp, Building2, User, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lead } from '@/types/Lead';

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

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            RESUMEN
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            {/* Deal Value */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <Euro className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(lead.deal_value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Valor del deal
                </div>
              </div>
            </div>

            {/* Organization */}
            {lead.company_name && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{lead.company_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Organización
                  </div>
                </div>
              </div>
            )}

            {/* Person */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted-foreground">
                  {lead.email}
                </div>
                <div className="text-xs text-muted-foreground">
                  Persona
                </div>
              </div>
            </div>

            {/* Expected Close Date */}
            {lead.estimated_close_date && (
              <div className="pt-2 border-t border-border">
                <div className="text-sm">
                  <span className="text-muted-foreground">Fecha de cierre esperada: </span>
                  <span className="font-medium">
                    {new Date(lead.estimated_close_date).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
