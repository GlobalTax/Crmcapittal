import { Building2, MapPin, Euro, Users, Calendar, Hash, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompanyEnrichments } from '@/hooks/useCompanyEnrichments';
import { Company } from '@/types/Company';

interface CompanyEinformaTabProps {
  company: Company;
}

export const CompanyEinformaTab = ({ company }: CompanyEinformaTabProps) => {
  const { enrichmentData, isLoading, error } = useCompanyEnrichments(company.id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Error al cargar datos de eInforma</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!enrichmentData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Esta empresa aún no ha sido enriquecida con eInforma.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Usa el botón "Actualizar desde eInforma" para obtener datos actualizados.
          </p>
        </div>
      </div>
    );
  }

  const formatNumber = (num?: number) => {
    if (!num) return 'No disponible';
    return new Intl.NumberFormat('es-ES').format(num);
  };

  const formatCurrency = (num?: number) => {
    if (!num) return 'No disponible';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with last update */}
      {enrichmentData.fechaActualizacion && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            Actualizado: {formatDate(enrichmentData.fechaActualizacion)}
          </Badge>
        </div>
      )}

      {/* Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sector */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Sector</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {enrichmentData.sector || 'No disponible'}
            </p>
          </CardContent>
        </Card>

        {/* Ubicación */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {enrichmentData.ubicacion || 'No disponible'}
            </p>
          </CardContent>
        </Card>

        {/* Ingresos */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Ingresos Estimados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {formatCurrency(enrichmentData.ingresos)}
            </p>
          </CardContent>
        </Card>

        {/* Empleados */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Nº de Empleados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {enrichmentData.empleados ? formatNumber(enrichmentData.empleados) : 'No disponible'}
            </p>
          </CardContent>
        </Card>

        {/* Año Constitución */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">Año de Constitución</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {enrichmentData.anoConstitucion || 'No disponible'}
            </p>
          </CardContent>
        </Card>

        {/* CNAE */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-3">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium ml-2">CNAE</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {enrichmentData.cnae || 'No disponible'}
            </p>
            {enrichmentData.cnaDescripcion && (
              <p className="text-sm text-muted-foreground mt-1">
                {enrichmentData.cnaDescripcion}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Patrimonio Neto */}
        {enrichmentData.patrimonioNeto && (
          <Card className="md:col-span-2">
            <CardHeader className="flex flex-row items-center space-y-0 pb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium ml-2">Patrimonio Neto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {formatCurrency(enrichmentData.patrimonioNeto)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};