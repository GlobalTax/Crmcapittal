import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Deal } from '@/types/Deal';
import { Badge } from '@/components/ui/badge';
import { Building2, Calendar, User, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DealDrawerProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DealDrawer = ({ deal, open, onOpenChange }: DealDrawerProps) => {
  if (!deal) return null;

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="space-y-4">
          <div className="space-y-2">
            <SheetTitle className="text-xl">{deal.title}</SheetTitle>
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: getStageColor(deal.stage) }}
              />
              <Badge variant="secondary">{deal.stage}</Badge>
              <span className="text-sm text-muted-foreground">
                {deal.probability}% probability
              </span>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Deal Value */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Euro className="h-4 w-4" />
              Deal Value
            </div>
            <p className="text-2xl font-semibold text-success">
              {formatCurrency(deal.amount)}
            </p>
          </div>

          {/* Company Information */}
          {deal.company && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="h-4 w-4" />
                Company
              </div>
              <div className="pl-6">
                <p className="font-medium">{deal.company.name}</p>
                {deal.company.industry && (
                  <p className="text-sm text-muted-foreground">{deal.company.industry}</p>
                )}
                {deal.company.website && (
                  <a 
                    href={deal.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {deal.company.website}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Owner Information */}
          {deal.owner && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Deal Owner
              </div>
              <div className="pl-6">
                <p className="font-medium">{deal.owner.name}</p>
                {deal.owner.email && (
                  <p className="text-sm text-muted-foreground">{deal.owner.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Timeline
            </div>
            <div className="pl-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{format(new Date(deal.createdAt), 'PPp', { locale: es })}</span>
              </div>
              {deal.updatedAt !== deal.createdAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span>{format(new Date(deal.updatedAt), 'PPp', { locale: es })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activities Timeline Placeholder */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Activity Timeline</h3>
            <div className="pl-6 text-sm text-muted-foreground">
              <p>No activities recorded yet.</p>
            </div>
          </div>

          {/* Notes Placeholder */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notes</h3>
            <div className="pl-6 text-sm text-muted-foreground">
              <p>No notes added yet.</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};