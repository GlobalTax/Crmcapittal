import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Building2 } from 'lucide-react';
import { MandateTarget } from '@/types/BuyingMandate';
import { TargetProgressBar } from '@/components/mandates/TargetProgressBar';

interface ClientTargetsListProps {
  targets: MandateTarget[];
}

export const ClientTargetsList = ({ targets }: ClientTargetsListProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusInfo = (target: MandateTarget) => {
    const statusConfig = {
      pending: { label: 'Pendiente', icon: Clock, color: 'text-muted-foreground' },
      contacted: { label: 'Contactado', icon: CheckCircle, color: 'text-blue-600' },
      in_analysis: { label: 'En Análisis', icon: Clock, color: 'text-yellow-600' },
      interested: { label: 'Interesado', icon: CheckCircle, color: 'text-green-600' },
      nda_signed: { label: 'NDA Firmado', icon: CheckCircle, color: 'text-green-700' },
      rejected: { label: 'No Interesado', icon: Clock, color: 'text-gray-500' },
      closed: { label: 'Proceso Cerrado', icon: Clock, color: 'text-gray-600' },
    };
    return statusConfig[target.status] || statusConfig.pending;
  };

  if (targets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Empresas Objetivo</CardTitle>
          <CardDescription>
            Lista de empresas identificadas para este mandato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Aún no se han identificado empresas objetivo para este mandato
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="h-5 w-5" />
          <span>Empresas Objetivo ({targets.length})</span>
        </CardTitle>
        <CardDescription>
          Estado actual del proceso de contacto con las empresas identificadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {targets.map((target) => {
            const statusInfo = getStatusInfo(target);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div
                key={target.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg">{target.company_name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      {target.sector && (
                        <span>{target.sector}</span>
                      )}
                      {target.location && (
                        <>
                          <span>•</span>
                          <span>{target.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
                    <Badge variant="outline" className="text-xs">
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                {/* Progress Bar */}
                <TargetProgressBar 
                  status={target.status} 
                  contacted={target.contacted}
                  className="mt-3"
                />

                {/* Contact Information */}
                {target.contacted && target.contact_date && (
                  <div className="bg-muted/50 rounded-md p-3 text-sm">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Empresa contactada</span>
                    </div>
                    <div className="text-muted-foreground mt-1">
                      Fecha de contacto: {formatDate(target.contact_date)}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="text-xs text-muted-foreground">
                  Última actualización: {formatDate(target.updated_at)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};