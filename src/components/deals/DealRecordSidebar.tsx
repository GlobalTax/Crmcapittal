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
      'Lead': '#6b7280',        // Professional gray
      'In Progress': '#f59e0b', // Soft orange
      'Won': '#059669',         // Professional green
      'Lost': '#dc2626'         // Soft red
    };
    return colors[stage] || '#6b7280';
  };

  const highlights = [
    {
      icon: Euro,
      label: 'Value',
      value: formatCurrency(deal.amount),
      className: 'text-success'
    },
    {
      icon: User,
      label: 'Owner',
      value: deal.owner?.name || 'Unassigned',
      subvalue: deal.owner?.email
    },
    {
      icon: Building2,
      label: 'Company',
      value: deal.company?.name || 'No company',
      subvalue: deal.company?.industry
    },
    {
      icon: TrendingUp,
      label: 'Probability',
      value: `${deal.probability}%`
    }
  ];

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Quick Highlights Grid */}
      <div className="highlights-grid">
        {highlights.map((highlight, index) => (
          <div key={index} className="space-y-2 p-3 bg-background rounded-lg border border-border/50">
            <div className="flex items-center gap-2">
              <highlight.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {highlight.label}
              </span>
            </div>
            <div className="space-y-1">
              <p className={`text-sm font-semibold ${highlight.className || 'text-foreground'}`}>
                {highlight.value}
              </p>
              {highlight.subvalue && (
                <p className="text-xs text-muted-foreground truncate">
                  {highlight.subvalue}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Accordion Details */}
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

              {/* Company Details */}
              {deal.company?.website && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Website</p>
                  <a 
                    href={deal.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline truncate block"
                  >
                    {deal.company.website}
                  </a>
                </div>
              )}

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