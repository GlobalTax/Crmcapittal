
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Deal } from "@/types/Deal";
import { Building2, Euro, User, Calendar, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export const DealCard = ({ deal, isDragging }: DealCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return "bg-neutral-50 text-neutral-600 border-neutral-200";
      case 'media': return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 'alta': return "bg-orange-50 text-orange-700 border-orange-200";
      case 'urgente': return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-neutral-50 text-neutral-600 border-neutral-200";
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return null;
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: deal.currency || 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card 
      className={`hover-lift cursor-pointer mb-3 ${
        isDragging ? 'opacity-50 rotate-1' : ''
      }`}
    >
      <CardHeader className="pb-2 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h5 className="text-md font-semibold text-foreground leading-tight">
              {deal.deal_name}
            </h5>
            {deal.company_name && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <Building2 className="h-3 w-3 mr-1" />
                {deal.company_name}
              </div>
            )}
          </div>
          <Badge 
            className={`${getPriorityColor(deal.priority)} text-xs font-medium`}
            variant="outline"
          >
            {deal.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 p-4 space-y-3">
        {/* Deal Value */}
        {deal.deal_value && (
          <div className="flex items-center text-lg font-bold text-foreground">
            <Euro className="h-4 w-4 mr-1" />
            {formatCurrency(deal.deal_value)}
          </div>
        )}

        {/* Deal Type */}
        <div className="text-sm text-muted-foreground capitalize">
          {deal.deal_type}
        </div>

        {/* Contact Info - Usando información del contacto asociado */}
        {deal.contact && (
          <div className="space-y-2 p-3 bg-neutral-50 border border-border rounded-md">
            <div className="flex items-center text-sm font-medium text-foreground">
              <User className="h-3 w-3 mr-1" />
              {deal.contact.name}
              {deal.contact.position && ` (${deal.contact.position})`}
            </div>
            {deal.contact.company && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 mr-1" />
                {deal.contact.company}
              </div>
            )}
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              {deal.contact.email && (
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {deal.contact.email}
                </div>
              )}
              {deal.contact.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {deal.contact.phone}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Financial Info */}
        {(deal.revenue || deal.ebitda) && (
          <div className="text-xs text-muted-foreground space-y-1">
            {deal.revenue && (
              <div>Facturación: {formatCurrency(deal.revenue)}</div>
            )}
            {deal.ebitda && (
              <div>EBITDA: {formatCurrency(deal.ebitda)}</div>
            )}
          </div>
        )}

        {/* Deal Owner */}
        {deal.deal_owner && (
          <div className="text-xs text-muted-foreground">
            Responsable: {deal.deal_owner.replace('_', ' ')}
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(deal.created_at), 'dd MMM yyyy', { locale: es })}
        </div>
      </CardContent>
    </Card>
  );
};
