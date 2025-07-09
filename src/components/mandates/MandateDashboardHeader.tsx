import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, User, Calendar, Edit } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';

interface MandateDashboardHeaderProps {
  mandate: BuyingMandate;
  totalTargets: number;
  contactedTargets: number;
}

export const MandateDashboardHeader = ({ 
  mandate, 
  totalTargets, 
  contactedTargets 
}: MandateDashboardHeaderProps) => {
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

  return (
    <div className="px-6 py-4 border-b bg-card">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{mandate.mandate_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(mandate.status)}
                <span className="text-sm text-muted-foreground">
                  ID: {mandate.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>

          {/* Client & Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium ml-1">{mandate.client_name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Contacto:</span>
                <span className="font-medium ml-1">{mandate.client_contact}</span>
              </div>
            </div>

            {mandate.assigned_user_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Responsable:</span>
                  <span className="font-medium ml-1">{mandate.assigned_user_name}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Inicio:</span>
                <span className="font-medium ml-1">{formatDate(mandate.start_date)}</span>
              </div>
            </div>

            {mandate.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">Fin estimado:</span>
                  <span className="font-medium ml-1">{formatDate(mandate.end_date)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <span className="text-muted-foreground">Actualizado:</span>
                <span className="font-medium ml-1">{formatDate(mandate.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar Mandato
          </Button>
        </div>
      </div>
    </div>
  );
};