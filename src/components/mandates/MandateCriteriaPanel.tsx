import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, TrendingUp, FileText, Edit } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface MandateCriteriaPanelProps {
  mandate: BuyingMandate;
}

export const MandateCriteriaPanel = ({ mandate }: MandateCriteriaPanelProps) => {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Criterios de Búsqueda</h2>
          <p className="text-muted-foreground">
            Parámetros y filtros para la identificación de targets
          </p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Editar Criterios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sectores Objetivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Sectores Objetivo
            </CardTitle>
            <CardDescription>
              Industrias y sectores de interés para el mandato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mandate.target_sectors && mandate.target_sectors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mandate.target_sectors.map((sector, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {sector}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Sin sectores específicos definidos</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ubicaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Ubicaciones Geográficas
            </CardTitle>
            <CardDescription>
              Regiones y países objetivo para la búsqueda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mandate.target_locations && mandate.target_locations.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mandate.target_locations.map((location, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {location}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Sin restricciones geográficas específicas</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Criterios Financieros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              Criterios Financieros
            </CardTitle>
            <CardDescription>
              Rangos de facturación y rentabilidad objetivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Facturación Mínima</label>
                  <p className="text-sm font-mono">{formatCurrency(mandate.min_revenue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Facturación Máxima</label>
                  <p className="text-sm font-mono">{formatCurrency(mandate.max_revenue)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EBITDA Mínimo</label>
                  <p className="text-sm font-mono">{formatCurrency(mandate.min_ebitda)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">EBITDA Máximo</label>
                  <p className="text-sm font-mono">{formatCurrency(mandate.max_ebitda)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Otros Criterios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Criterios Adicionales
            </CardTitle>
            <CardDescription>
              Requisitos específicos y consideraciones especiales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mandate.other_criteria ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm whitespace-pre-wrap">{mandate.other_criteria}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Sin criterios adicionales especificados</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Resumen de Criterios
          </CardTitle>
          <CardDescription>
            Resumen de los parámetros de búsqueda configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Sectores definidos:</span>
                <span className="font-medium">{mandate.target_sectors?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Ubicaciones:</span>
                <span className="font-medium">{mandate.target_locations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Criterios financieros:</span>
                <span className="font-medium">
                  {(mandate.min_revenue || mandate.max_revenue || mandate.min_ebitda || mandate.max_ebitda) ? 'Definidos' : 'No definidos'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};