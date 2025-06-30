
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin } from "lucide-react";
import { Deal } from "@/types/Deal";

interface CompanyInfoSectionProps {
  deal: Deal;
}

export const CompanyInfoSection = ({ deal }: CompanyInfoSectionProps) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!deal.company_name) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Información de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre de la Empresa</label>
            <p className="mt-1 font-medium">{deal.company_name}</p>
          </div>
          {deal.sector && (
            <div>
              <label className="text-sm font-medium text-gray-500">Sector</label>
              <p className="mt-1">{deal.sector}</p>
            </div>
          )}
          {deal.location && (
            <div>
              <label className="text-sm font-medium text-gray-500">Ubicación</label>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span>{deal.location}</span>
              </div>
            </div>
          )}
          {deal.employees && (
            <div>
              <label className="text-sm font-medium text-gray-500">Empleados</label>
              <p className="mt-1">{deal.employees}</p>
            </div>
          )}
        </div>

        {(deal.revenue || deal.ebitda) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {deal.revenue && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ingresos</label>
                  <p className="mt-1 font-medium">{formatCurrency(deal.revenue)}</p>
                </div>
              )}
              {deal.ebitda && (
                <div>
                  <label className="text-sm font-medium text-gray-500">EBITDA</label>
                  <p className="mt-1 font-medium">{formatCurrency(deal.ebitda)}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
