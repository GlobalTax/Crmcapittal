
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Deal } from "@/types/Deal";
import { Building2, Euro, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export const DealCard = ({ deal, isDragging }: DealCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'baja': return "bg-gray-100 text-gray-800 border-gray-200";
      case 'media': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'alta': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'urgente': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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
      className={`bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer mb-3 ${
        isDragging ? 'opacity-50 rotate-2' : ''
      }`}
    >
      <CardHeader className="pb-2 p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h5 className="text-md font-semibold text-slate-900 leading-tight">
              {deal.deal_name}
            </h5>
            {deal.company_name && (
              <div className="flex items-center text-sm text-slate-600 mt-1">
                <Building2 className="h-3 w-3 mr-1" />
                {deal.company_name}
              </div>
            )}
          </div>
          <Badge 
            className={`${getPriorityColor(deal.priority)} border text-xs`}
            variant="outline"
          >
            {deal.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 p-4 space-y-3">
        {/* Deal Value */}
        {deal.deal_value && (
          <div className="flex items-center text-lg font-bold text-slate-900">
            <Euro className="h-4 w-4 mr-1" />
            {formatCurrency(deal.deal_value)}
          </div>
        )}

        {/* Deal Type */}
        <div className="text-sm text-slate-600 capitalize">
          {deal.deal_type}
        </div>

        {/* Contact Info */}
        {deal.contact_name && (
          <div className="flex items-center text-sm text-slate-600">
            <User className="h-3 w-3 mr-1" />
            {deal.contact_name}
            {deal.contact_role && ` (${deal.contact_role})`}
          </div>
        )}

        {/* Financial Info */}
        {(deal.revenue || deal.ebitda) && (
          <div className="text-xs text-slate-500 space-y-1">
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
          <div className="text-xs text-slate-500">
            Responsable: {deal.deal_owner.replace('_', ' ')}
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center text-xs text-slate-400">
          <Calendar className="h-3 w-3 mr-1" />
          {format(new Date(deal.created_at), 'dd MMM yyyy', { locale: es })}
        </div>
      </CardContent>
    </Card>
  );
};
