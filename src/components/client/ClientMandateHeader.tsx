import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BuyingMandate } from '@/types/BuyingMandate';
import { MandateSectors } from '@/components/mandates/MandateSectors';
import { MandateTimeline } from '@/components/mandates/MandateTimeline';
import { MandateProgress } from '@/components/mandates/MandateProgress';

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
              {mandate.assigned_user_name && (
                <>
                  <br />
                  Usuario asignado: <span className="font-medium">{mandate.assigned_user_name}</span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(mandate.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MandateSectors 
            sectors={mandate.target_sectors}
            locations={mandate.target_locations}
          />
          
          <MandateTimeline 
            startDate={mandate.start_date}
            endDate={mandate.end_date}
            createdAt={mandate.created_at}
            status={mandate.status}
          />
          
          <MandateProgress 
            totalTargets={totalTargets}
            contactedTargets={contactedTargets}
          />
        </div>
      </CardContent>
    </Card>
  );
};