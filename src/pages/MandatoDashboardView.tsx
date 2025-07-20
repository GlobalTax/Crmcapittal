
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ImprovedMandateHeader } from '@/components/mandates/ImprovedMandateHeader';
import { MandateQuickActions } from '@/components/mandates/MandateQuickActions';
import { MandateRecentActivity } from '@/components/mandates/MandateRecentActivity';
import { MandatoCriteria } from '@/components/mandates/MandatoCriteria';
import { MandateProgress } from '@/components/mandates/MandateProgress';
import { MandatoDocs } from '@/components/mandates/MandatoDocs';
import { MandatoActivityLog } from '@/components/mandates/MandatoActivityLog';
import { MandatoConfig } from '@/components/mandates/MandatoConfig';
import { MandatoClientAccess } from '@/components/mandates/MandatoClientAccess';
import { useMandatoById } from '@/hooks/useMandatoById';
import { 
  Target, 
  FileText, 
  Activity, 
  Settings, 
  Users, 
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function MandatoDashboardView() {
  const { id } = useParams();
  const { mandato, isLoading } = useMandatoById(id);

  if (isLoading || !mandato) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando mandato...</p>
      </div>
    </div>
  );

  // Mock data para los KPIs
  const mockStats = {
    totalTargets: 24,
    contactedTargets: 8,
    interestedTargets: 3,
    documentsCount: 12,
    activitiesCount: 15,
    completionRate: Math.round((8 / 24) * 100)
  };

  const handleEdit = () => {
    console.log('Editar mandato');
  };

  const handleAddTarget = () => {
    console.log('Añadir nuevo target');
  };

  const handleBulkContact = () => {
    console.log('Contacto masivo');
  };

  const handleScheduleFollowup = () => {
    console.log('Programar seguimiento');
  };

  const handleExportData = () => {
    console.log('Exportar datos');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header mejorado */}
      <ImprovedMandateHeader 
        mandate={mandato}
        totalTargets={mockStats.totalTargets}
        contactedTargets={mockStats.contactedTargets}
        interestedTargets={mockStats.interestedTargets}
        onEdit={handleEdit}
      />

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="targets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Targets</span>
              <Badge variant="secondary" className="ml-1 hidden md:inline">
                {mockStats.totalTargets}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Actividad</span>
              <Badge variant="secondary" className="ml-1 hidden md:inline">
                {mockStats.activitiesCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documentos</span>
              <Badge variant="secondary" className="ml-1 hidden md:inline">
                {mockStats.documentsCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Acceso</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Resumen */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Columna principal */}
              <div className="lg:col-span-3 space-y-6">
                {/* KPIs rápidos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Progreso</p>
                          <p className="text-2xl font-bold text-primary">{mockStats.completionRate}%</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <Progress value={mockStats.completionRate} className="mt-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Contactados</p>
                          <p className="text-2xl font-bold text-green-600">{mockStats.contactedTargets}</p>
                          <p className="text-xs text-muted-foreground">de {mockStats.totalTargets}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Interesados</p>
                          <p className="text-2xl font-bold text-orange-600">{mockStats.interestedTargets}</p>
                          <p className="text-xs text-muted-foreground">{Math.round((mockStats.interestedTargets / mockStats.contactedTargets) * 100)}% conv.</p>
                        </div>
                        <Target className="h-8 w-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Pendientes</p>
                          <p className="text-2xl font-bold text-red-600">{mockStats.totalTargets - mockStats.contactedTargets}</p>
                          <p className="text-xs text-muted-foreground">por contactar</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Actividad reciente */}
                <MandateRecentActivity />

                {/* Criterios del mandato */}
                <MandatoCriteria mandate={mandato} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <MandateQuickActions 
                  mandate={mandato}
                  onAddTarget={handleAddTarget}
                  onBulkContact={handleBulkContact}
                  onScheduleFollowup={handleScheduleFollowup}
                  onExportData={handleExportData}
                />
                
                <MandateProgress 
                  totalTargets={mockStats.totalTargets}
                  contactedTargets={mockStats.contactedTargets}
                />

                {/* Timeline rápido */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <div>
                          <p className="font-medium">Mandato creado</p>
                          <p className="text-xs text-muted-foreground">Hace 15 días</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">8 targets contactados</p>
                          <p className="text-xs text-muted-foreground">Última semana</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">3 respuestas positivas</p>
                          <p className="text-xs text-muted-foreground">Esta semana</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Targets */}
          <TabsContent value="targets">
            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
              <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Gestión de Targets</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Gestiona la lista completa de empresas objetivo, su estado de contacto y el pipeline de seguimiento
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={handleAddTarget}>
                  <Target className="h-4 w-4 mr-2" />
                  Nuevo Target
                </Button>
                <Button variant="outline">
                  Ver Todos los Targets ({mockStats.totalTargets})
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Tab: Actividad */}
          <TabsContent value="activity">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MandatoActivityLog mandateId={mandato.id} />
              </div>
              <div>
                <MandateRecentActivity />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Documentos */}
          <TabsContent value="documents">
            <MandatoDocs mandateId={mandato.id} />
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings">
            <MandatoConfig mandate={mandato} />
          </TabsContent>

          {/* Tab: Acceso Cliente */}
          <TabsContent value="access">
            <MandatoClientAccess mandateId={mandato.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
