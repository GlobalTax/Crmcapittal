import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MandatoKPIHeader } from '@/components/mandates/MandatoKPIHeader';
import { MandatoTargetPanel } from '@/components/mandates/MandatoTargetPanel';
import { MandatoDocs } from '@/components/mandates/MandatoDocs';
import { MandatoActivityLog } from '@/components/mandates/MandatoActivityLog';
import { MandatoCriteria } from '@/components/mandates/MandatoCriteria';
import { MandatoConfig } from '@/components/mandates/MandatoConfig';
import { MandatoClientAccess } from '@/components/mandates/MandatoClientAccess';
import { useMandatoById } from '@/hooks/useMandatoById';

export default function MandatoDashboardView() {
  const { id } = useParams();
  const { mandato, isLoading } = useMandatoById(id);

  if (isLoading || !mandato) return <div>Cargando mandato...</div>;

  // Mock data para los KPIs (necesario para el componente actual)
  const mockTargets: any[] = [];
  const mockDocuments: any[] = [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{mandato.mandate_name}</CardTitle>
              <CardDescription className="text-base mt-2">
                Cliente: <span className="font-medium">{mandato.client_name}</span><br />
                Responsable: <span className="font-medium">{mandato.assigned_user_name ?? 'No asignado'}</span><br />
                Estado: <Badge>{mandato.status}</Badge>
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
          <MandatoTargetPanel 
            targets={mockTargets}
            documents={mockDocuments}
            onEditTarget={() => {}}
            onViewDocuments={() => {}}
          />
        </TabsContent>
        <TabsContent value="docs">
          <MandatoDocs mandateId={mandato.id} />
        </TabsContent>
        <TabsContent value="activity">
          <MandatoActivityLog mandateId={mandato.id} />
        </TabsContent>
        <TabsContent value="criteria">
          <MandatoCriteria mandate={mandato} />
        </TabsContent>
        <TabsContent value="config">
          <MandatoConfig mandate={mandato} />
        </TabsContent>
        <TabsContent value="access">
          <MandatoClientAccess mandateId={mandato.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}