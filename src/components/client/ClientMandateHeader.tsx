import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BuyingMandate } from '@/types/BuyingMandate';

interface ClientMandateHeaderProps {
  mandate: BuyingMandate;
  totalTargets: number;
  contactedTargets: number;
}

export const ClientMandateHeader = ({ mandate, totalTargets, contactedTargets }: ClientMandateHeaderProps) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const completionRate = totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{mandate.mandate_name}</CardTitle>
            <CardDescription className="text-base mt-2">
              Cliente: <span className="font-medium">{mandate.client_name}</span>
              <br />
              Contacto: <span className="font-medium">{mandate.client_contact}</span>
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(mandate.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sectores Objetivo */}
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

          {/* Timeline */}
          <div>
            <h4 className="font-medium mb-2">Timeline</h4>
            <div className="space-y-1 text-sm">
              <div>Inicio: {formatDate(mandate.start_date)}</div>
              {mandate.end_date && (
                <div>Fin estimado: {formatDate(mandate.end_date)}</div>
              )}
              <div className="text-muted-foreground">
                Mandato iniciado: {formatDate(mandate.created_at)}
              </div>
            </div>
          </div>

          {/* Progreso */}
          <div>
            <h4 className="font-medium mb-2">Progreso del Proceso</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Empresas identificadas</span>
                <span className="font-medium">{totalTargets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Empresas contactadas</span>
                <span className="font-medium text-primary">{contactedTargets}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
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
      </CardContent>
    </Card>
  );
};