
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Target, FileText, Activity, Settings, Users, BarChart3 } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { ImprovedMandateHeader } from '@/components/mandates/ImprovedMandateHeader';
import { MandateQuickActions } from '@/components/mandates/MandateQuickActions';
import { MandateRecentActivity } from '@/components/mandates/MandateRecentActivity';
import { MandatoCriteria } from '@/components/mandates/MandatoCriteria';
import { MandateProgress } from '@/components/mandates/MandateProgress';

interface CollapsibleMandatePanelProps {
  mandate: BuyingMandate;
  onEdit: (mandate: BuyingMandate) => void;
  onUpdate?: (mandate: BuyingMandate) => void;
}

export const CollapsibleMandatePanel = ({ mandate, onEdit, onUpdate }: CollapsibleMandatePanelProps) => {
  const navigate = useNavigate();

  // Mock data - en producción vendría de los hooks correspondientes
  const mockStats = {
    totalTargets: 24,
    contactedTargets: 8,
    interestedTargets: 3,
    documentsCount: 12
  };

  const handleAddTarget = () => {
    console.log('Añadir nuevo target');
    // Implementar lógica para añadir target
  };

  const handleBulkContact = () => {
    console.log('Contacto masivo');
    // Implementar lógica para contacto masivo
  };

  const handleScheduleFollowup = () => {
    console.log('Programar seguimiento');
    // Implementar lógica para programar seguimiento
  };

  const handleExportData = () => {
    console.log('Exportar datos');
    // Implementar lógica para exportar datos
  };

  return (
    <div className="space-y-6">
      {/* Header mejorado */}
      <ImprovedMandateHeader 
        mandate={mandate}
        totalTargets={mockStats.totalTargets}
        contactedTargets={mockStats.contactedTargets}
        interestedTargets={mockStats.interestedTargets}
        onEdit={onEdit}
      />

      {/* Contenido organizado en pestañas */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="targets" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Targets</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Actividad</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              <MandateRecentActivity />
              
              {/* Criterios detallados */}
              <MandatoCriteria mandate={mandate} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <MandateQuickActions 
                mandate={mandate}
                onAddTarget={handleAddTarget}
                onBulkContact={handleBulkContact}
                onScheduleFollowup={handleScheduleFollowup}
                onExportData={handleExportData}
              />
              
              <MandateProgress 
                totalTargets={mockStats.totalTargets}
                contactedTargets={mockStats.contactedTargets}
                className="lg:block"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="targets" className="mt-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Gestión de Targets</h3>
            <p className="text-muted-foreground mb-4">
              Aquí se mostrará la lista completa de targets y el pipeline de seguimiento
            </p>
            <Button onClick={() => navigate(`/mandatos/${mandate.id}/targets`)}>
              <Target className="h-4 w-4 mr-2" />
              Ver Todos los Targets
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MandateRecentActivity />
            </div>
            <div>
              <div className="text-center py-8 bg-muted/30 rounded-lg border">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Timeline completo próximamente</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Documentos del Mandato</h3>
            <p className="text-muted-foreground mb-4">
              Gestiona todos los documentos relacionados con este mandato
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
              <Button onClick={() => navigate(`/mandatos/${mandate.id}/documentos`)}>
                Ver Documentos
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Configuración del Mandato</h3>
            <p className="text-muted-foreground mb-4">
              Modifica los criterios, configuraciones y accesos del mandato
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={() => onEdit(mandate)}>
                <Settings className="h-4 w-4 mr-2" />
                Editar Configuración
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Accesos
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
