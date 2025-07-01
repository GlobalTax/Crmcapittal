
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin } from "lucide-react";
import { Negocio } from "@/types/Negocio";

interface CompanyInfoSectionProps {
  negocio: Negocio;
}

export const CompanyInfoSection = ({ negocio }: CompanyInfoSectionProps) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!negocio.company && !negocio.sector) return null;

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
          {negocio.company && (
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre de la Empresa</label>
              <p className="mt-1 font-medium">{negocio.company.name}</p>
            </div>
          )}
          {negocio.sector && (
            <div>
              <label className="text-sm font-medium text-gray-500">Sector</label>
              <p className="mt-1">{negocio.sector}</p>
            </div>
          )}
          {negocio.ubicacion && (
            <div>
              <label className="text-sm font-medium text-gray-500">Ubicación</label>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span>{negocio.ubicacion}</span>
              </div>
            </div>
          )}
          {negocio.empleados && (
            <div>
              <label className="text-sm font-medium text-gray-500">Empleados</label>
              <p className="mt-1">{negocio.empleados}</p>
            </div>
          )}
        </div>

        {(negocio.ingresos || negocio.ebitda) && (
          <>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              {negocio.ingresos && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ingresos</label>
                  <p className="mt-1 font-medium">{formatCurrency(negocio.ingresos)}</p>
                </div>
              )}
              {negocio.ebitda && (
                <div>
                  <label className="text-sm font-medium text-gray-500">EBITDA</label>
                  <p className="mt-1 font-medium">{formatCurrency(negocio.ebitda)}</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
