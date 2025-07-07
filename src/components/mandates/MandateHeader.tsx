import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Settings, Users } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { useNavigate } from 'react-router-dom';

interface MandateHeaderProps {
  mandate: BuyingMandate;
  totalTargets: number;
  contactedTargets: number;
}

export const MandateHeader = ({ mandate, totalTargets, contactedTargets }: MandateHeaderProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: BuyingMandate['status']) => {
    const statusConfig = {
      active: { label: 'Activo', variant: 'default' as const },
      paused: { label: 'Pausado', variant: 'secondary' as const },
      completed: { label: 'Completado', variant: 'outline' as const },
      cancelled: { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const completionRate = totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/buying-mandates')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Mandatos
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/buying-mandates">Mandatos de Compra</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{mandate.mandate_name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Mandate Info Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{mandate.mandate_name}</CardTitle>
              <CardDescription className="text-base mt-1">
                Cliente: <span className="font-medium">{mandate.client_name}</span>
                {mandate.client_contact && (
                  <> • Contacto: <span className="font-medium">{mandate.client_contact}</span></>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(mandate.status)}
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                Configurar
              </Button>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Acceso Cliente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Criteria */}
            <div>
              <h4 className="font-medium mb-2">Sectores Objetivo</h4>
              <div className="flex flex-wrap gap-1">
                {mandate.target_sectors.map((sector) => (
                  <Badge key={sector} variant="outline" className="text-xs">
                    {sector}
                  </Badge>
                ))}
              </div>
              {mandate.target_locations && mandate.target_locations.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-sm font-medium text-muted-foreground">Ubicaciones:</h5>
                  <p className="text-sm">{mandate.target_locations.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Financial Criteria */}
            <div>
              <h4 className="font-medium mb-2">Criterios Financieros</h4>
              <div className="space-y-1 text-sm">
                {mandate.min_revenue && (
                  <div>Min. Facturación: {formatCurrency(mandate.min_revenue)}</div>
                )}
                {mandate.max_revenue && (
                  <div>Max. Facturación: {formatCurrency(mandate.max_revenue)}</div>
                )}
                {mandate.min_ebitda && (
                  <div>Min. EBITDA: {formatCurrency(mandate.min_ebitda)}</div>
                )}
                {mandate.max_ebitda && (
                  <div>Max. EBITDA: {formatCurrency(mandate.max_ebitda)}</div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="font-medium mb-2">Timeline</h4>
              <div className="space-y-1 text-sm">
                <div>Inicio: {formatDate(mandate.start_date)}</div>
                {mandate.end_date && (
                  <div>Fin: {formatDate(mandate.end_date)}</div>
                )}
                <div className="text-muted-foreground">
                  Creado: {formatDate(mandate.created_at)}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <h4 className="font-medium mb-2">Progreso</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Targets identificados</span>
                  <span className="font-medium">{totalTargets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Contactados</span>
                  <span className="font-medium text-green-600">{contactedTargets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tasa de conversión</span>
                  <span className="font-medium">{completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {mandate.other_criteria && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Otros Criterios</h4>
              <p className="text-sm text-muted-foreground">{mandate.other_criteria}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};