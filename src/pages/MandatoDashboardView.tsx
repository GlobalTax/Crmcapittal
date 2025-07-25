import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MandatoKPIHeader } from '@/components/mandates/MandatoKPIHeader';
// MandatoTargetPanel removed - using new implementation
import { MandatoDocs } from '@/components/mandates/MandatoDocs';
import { MandatoActivityLog } from '@/components/mandates/MandatoActivityLog';
import { MandatoCriteria } from '@/components/mandates/MandatoCriteria';
import { MandatoConfig } from '@/components/mandates/MandatoConfig';
import { MandatoClientAccess } from '@/components/mandates/MandatoClientAccess';
import { useMandatoById } from '@/hooks/useMandatoById';

export default function MandatoDashboardView() {
  const { id } = useParams();
  const { mandate, loading } = useMandatoById(id);

  if (loading || !mandate) return <div>Cargando mandato...</div>;

  // Mock data para los KPIs (necesario para el componente actual)
  const mockTargets: any[] = [];
  const mockDocuments: any[] = [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{mandate.mandate_name}</CardTitle>
              <CardDescription className="text-base mt-2">
                Cliente: <span className="font-medium">{mandate.client_name}</span><br />
                Responsable: <span className="font-medium">{mandate.assigned_user_name ?? 'No asignado'}</span><br />
                Estado: <Badge>{mandate.status}</Badge>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">Editar</Button>
              <Button variant="outline">Exportar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <MandatoKPIHeader 
            totalTargets={0}
            contactedTargets={0}
            interestedTargets={0}
            documentsCount={0}
            targets={mockTargets}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="targets" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="targets">🎯 Targets</TabsTrigger>
          <TabsTrigger value="docs">📄 Documentos</TabsTrigger>
          <TabsTrigger value="activity">📘 Actividad</TabsTrigger>
          <TabsTrigger value="criteria">🗺️ Criterios</TabsTrigger>
          <TabsTrigger value="config">⚙️ Configuración</TabsTrigger>
          <TabsTrigger value="access">🔐 Acceso Cliente</TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <div className="p-6 text-center text-muted-foreground">
            Funcionalidad migrada a la nueva vista de mandatos
          </div>
        </TabsContent>
        <TabsContent value="docs">
          <MandatoDocs mandateId={mandate.id} />
        </TabsContent>
        <TabsContent value="activity">
          <MandatoActivityLog mandateId={mandate.id} />
        </TabsContent>
        <TabsContent value="criteria">
          <MandatoCriteria mandate={mandate} />
        </TabsContent>
        <TabsContent value="config">
          <MandatoConfig mandate={mandate} />
        </TabsContent>
        <TabsContent value="access">
          <MandatoClientAccess mandateId={mandate.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}