import { useParams } from 'react-router-dom';
import { ClientMandateLayout } from '@/components/layout/ClientMandateLayout';
import { ClientMandateHeader } from '@/components/client/ClientMandateHeader';
import { ClientTargetsList } from '@/components/client/ClientTargetsList';
import { ClientCommentsTimeline } from '@/components/client/ClientCommentsTimeline';
import { ClientDocumentDownloads } from '@/components/client/ClientDocumentDownloads';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Lock } from 'lucide-react';
import { useClientMandateAccess } from '@/hooks/useClientMandateAccess';

export default function ClientMandateView() {
  const { mandateId } = useParams<{ mandateId: string }>();
  
  if (!mandateId) {
    return (
      <ClientMandateLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mandato no encontrado</h2>
              <p className="text-muted-foreground">
                El ID del mandato no es válido o no se ha proporcionado.
              </p>
            </div>
          </CardContent>
        </Card>
      </ClientMandateLayout>
    );
  }

  const {
    isValidating,
    hasAccess,
    mandate,
    targets,
    documents,
    comments,
  } = useClientMandateAccess(mandateId);

  // Loading state
  if (isValidating) {
    return (
      <ClientMandateLayout>
        <LoadingSkeleton />
      </ClientMandateLayout>
    );
  }

  // Access denied state
  if (!hasAccess) {
    return (
      <ClientMandateLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Lock className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
              <p className="text-muted-foreground mb-4">
                No tiene permisos para acceder a este mandato o el token de acceso es inválido.
              </p>
              <div className="text-sm text-muted-foreground">
                <p>Posibles causas:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>El enlace de acceso ha expirado</li>
                  <li>El token de acceso no es válido</li>
                  <li>No se ha proporcionado un token de acceso</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </ClientMandateLayout>
    );
  }

  // No mandate data
  if (!mandate) {
    return (
      <ClientMandateLayout>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Mandato no encontrado</h2>
              <p className="text-muted-foreground">
                No se pudieron cargar los datos del mandato.
              </p>
            </div>
          </CardContent>
        </Card>
      </ClientMandateLayout>
    );
  }

  const contactedTargets = targets.filter(t => t.contacted).length;

  return (
    <ClientMandateLayout mandateName={mandate.mandate_name}>
      <div className="space-y-6">
        {/* Header with mandate info */}
        <ClientMandateHeader 
          mandate={mandate}
          totalTargets={targets.length}
          contactedTargets={contactedTargets}
        />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{targets.length}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas Identificadas
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{contactedTargets}</div>
                <p className="text-xs text-muted-foreground">
                  Empresas Contactadas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
                <p className="text-xs text-muted-foreground">
                  Documentos Disponibles
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            <ClientTargetsList targets={targets} />
            <ClientDocumentDownloads documents={documents} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ClientCommentsTimeline comments={comments} />
          </div>
        </div>
      </div>
    </ClientMandateLayout>
  );
}