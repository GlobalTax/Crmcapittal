import React from 'react';
import { Deal } from '@/types/Deal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, Euro, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DealRecordSidebarProps {
  deal: Deal;
  className?: string;
}

export const DealRecordSidebar = ({ deal, className = "" }: DealRecordSidebarProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No amount set';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    <div className={`w-full space-y-4 ${className}`}>
      <Accordion type="single" defaultValue="record-details" collapsible>
        <AccordionItem value="record-details">
          <AccordionTrigger className="text-sm font-medium">
            Record Details
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {/* Deal Name */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Deal Name</p>
                <p className="text-sm font-medium">{deal.title}</p>
              </div>

              {/* Stage */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Stage</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getStageColor(deal.stage) }}
                  />
                  <Badge variant="secondary" className="text-xs">
                    {deal.stage}
                  </Badge>
                </div>
              </div>

              {/* Value */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Euro className="h-3 w-3" />
                  Value
                </p>
                <p className="text-sm font-semibold text-success">
                  {formatCurrency(deal.amount)}
                </p>
              </div>

              {/* Owner */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Owner
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{deal.owner?.name || 'Unassigned'}</p>
                  {deal.owner?.email && (
                    <p className="text-xs text-muted-foreground">{deal.owner.email}</p>
                  )}
                </div>
              </div>

              {/* Company */}
              {deal.company && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    Company
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{deal.company.name}</p>
                    {deal.company.industry && (
                      <p className="text-xs text-muted-foreground">{deal.company.industry}</p>
                    )}
                    {deal.company.website && (
                      <a 
                        href={deal.company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        {deal.company.website}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Probability */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Probability
                </p>
                <p className="text-sm">{deal.probability}%</p>
              </div>

              {/* Dates */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(deal.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
                
                {deal.updatedAt !== deal.createdAt && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(deal.updatedAt), 'PPp', { locale: es })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lists">
          <AccordionTrigger className="text-sm font-medium">
            Lists
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                This record has not been added to any lists yet
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};