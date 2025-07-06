import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Calendar, Euro, Users, Hash } from 'lucide-react';
import { Company } from '@/types/Company';

interface EinformaData {
  sector?: string;
  ubicacion?: string;
  ingresos?: number;
  empleados?: number;
  anoConstitucion?: string;
  cnae?: string;
  cnaDescripcion?: string;
}

interface CompanyDataPanelProps {
  company: Company;
  enrichmentData?: EinformaData | null;
}

export const CompanyDataPanel = ({ company, enrichmentData }: CompanyDataPanelProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No disponible';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (!num) return 'No disponible';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  // Use eInforma data first, fallback to company data
  const ubicacion = enrichmentData?.ubicacion || [company.city, company.state].filter(Boolean).join(', ') || 'No disponible';
  const sector = enrichmentData?.sector || company.industry || 'No disponible';
  const anoFundacion = enrichmentData?.anoConstitucion || company.founded_year?.toString() || 'No disponible';
  const ingresos = enrichmentData?.ingresos || company.annual_revenue;
  const empleados = enrichmentData?.empleados;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Datos generales</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ubicación */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ubicación</span>
            </div>
            <p className="font-semibold">{ubicacion}</p>
          </CardContent>
        </Card>

        {/* Sector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sector</span>
              {enrichmentData?.sector && (
                <Badge variant="outline" className="text-xs">eInforma</Badge>
              )}
            </div>
            <p className="font-semibold">{sector}</p>
          </CardContent>
        </Card>

        {/* Año de fundación */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Año fundación</span>
              {enrichmentData?.anoConstitucion && (
                <Badge variant="outline" className="text-xs">eInforma</Badge>
              )}
            </div>
            <p className="font-semibold">{anoFundacion}</p>
          </CardContent>
        </Card>

        {/* CNAE */}
        {enrichmentData?.cnae && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">CNAE</span>
                <Badge variant="outline" className="text-xs">eInforma</Badge>
              </div>
              <p className="font-semibold">{enrichmentData.cnae}</p>
              {enrichmentData.cnaDescripcion && (
                <p className="text-sm text-muted-foreground mt-1">{enrichmentData.cnaDescripcion}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Ingresos */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Ingresos</span>
              {enrichmentData?.ingresos && (
                <Badge variant="outline" className="text-xs">eInforma</Badge>
              )}
            </div>
            <p className="font-semibold">{formatCurrency(ingresos)}</p>
          </CardContent>
        </Card>

        {/* Empleados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Empleados</span>
              {enrichmentData?.empleados && (
                <Badge variant="outline" className="text-xs">eInforma</Badge>
              )}
            </div>
            <p className="font-semibold">
              {empleados ? formatNumber(empleados) : company.company_size || 'No disponible'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};