import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Target, FileText, Calendar, MapPin, Settings, Lock, TrendingUp } from 'lucide-react';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { MandateDashboardHeader } from '@/components/mandates/MandateDashboardHeader';
import { MandatoKPIHeader } from '@/components/mandates/MandatoKPIHeader';
import { MandatoTargetPanel } from '@/components/mandates/MandatoTargetPanel';
import { MandatoDocs } from '@/components/mandates/MandatoDocs';
import { TargetDetailPanel } from '@/components/mandates/TargetDetailPanel';
import { MandatoActivityLog } from '@/components/mandates/MandatoActivityLog';
import { MandatoCriteria } from '@/components/mandates/MandatoCriteria';
import { MandatoConfig } from '@/components/mandates/MandatoConfig';
import { MandatoClientAccess } from '@/components/mandates/MandatoClientAccess';

export default function MandatoDashboardView() {
  const { mandateId } = useParams<{ mandateId: string }>();
  const [selectedTarget, setSelectedTarget] = useState<MandateTarget | null>(null);
  const [showTargetDetail, setShowTargetDetail] = useState(false);
  const [activeTab, setActiveTab] = useState('targets');
  
  const { 
    mandates, 
    targets, 
    documents, 
    fetchMandates, 
    fetchTargets, 
    fetchDocuments,
    isLoading 
  } = useBuyingMandates();

  const mandate = mandates.find(m => m.id === mandateId);
  const mandateTargets = targets.filter(t => t.mandate_id === mandateId);
  const mandateDocuments = documents.filter(d => d.mandate_id === mandateId);

  // Referencias para evitar dependencias circulares
  const initialized = useRef(false);
  const loadingData = useRef(false);
  const currentMandateId = useRef<string | undefined>(undefined);

  // Función consolidada para cargar datos
  const loadMandateData = useRef(async (mandateIdToLoad: string) => {
    if (loadingData.current) return;
    
    loadingData.current = true;
    try {
      console.log('🔄 Loading mandate data for:', mandateIdToLoad);
      await Promise.all([
        fetchTargets(mandateIdToLoad),
        fetchDocuments(mandateIdToLoad)
      ]);
    } catch (error) {
      console.error('❌ Error loading mandate data:', error);
    } finally {
      loadingData.current = false;
    }
  });

  // Efecto único y estable para inicialización y carga de datos
  useEffect(() => {
    const initializeAndLoad = async () => {
      // Solo inicializar una vez
      if (!initialized.current) {
        console.log('🚀 Initializing mandates...');
        await fetchMandates();
        initialized.current = true;
      }

      // Cargar datos específicos del mandato si cambió
      if (mandateId && mandateId !== currentMandateId.current && initialized.current) {
        console.log('📋 Loading data for mandate:', mandateId);
        currentMandateId.current = mandateId;
        await loadMandateData.current(mandateId);
      }
    };

    initializeAndLoad();
  }, [mandateId]);


  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActiveTab('targets');
            break;
          case '2':
            e.preventDefault();
            setActiveTab('documents');
            break;
          case '3':
            e.preventDefault();
            setActiveTab('activity');
            break;
          case '4':
            e.preventDefault();
            setActiveTab('criteria');
            break;
          case '5':
            e.preventDefault();
            setActiveTab('configuration');
            break;
          case '6':
            e.preventDefault();
            setActiveTab('client-access');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleEditTarget = (target: MandateTarget) => {
    setSelectedTarget(target);
    // Could open an edit dialog here
  };

  const handleViewDocuments = (target: MandateTarget) => {
    setSelectedTarget(target);
    setShowTargetDetail(true);
  };

  const contactedTargets = mandateTargets.filter(t => t.contacted).length;
  const interestedTargets = mandateTargets.filter(t => 
    ['interested', 'nda_signed'].includes(t.status)
  ).length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!mandate) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Mandato no encontrado
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <MandateDashboardHeader 
          mandate={mandate}
          totalTargets={mandateTargets.length}
          contactedTargets={contactedTargets}
        />
        <MandatoKPIHeader 
          totalTargets={mandateTargets.length}
          contactedTargets={contactedTargets}
          interestedTargets={interestedTargets}
          documentsCount={mandateDocuments.length}
          targets={mandateTargets}
        />
      </div>

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b px-6">
            <TabsList className="grid w-full max-w-6xl grid-cols-6 mx-auto">
              <TabsTrigger value="targets" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Targets</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Actividad</span>
              </TabsTrigger>
              <TabsTrigger value="criteria" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Criterios</span>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Config</span>
              </TabsTrigger>
              <TabsTrigger value="client-access" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Acceso</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="targets" className="h-full m-0 p-6">
              <MandatoTargetPanel
                targets={mandateTargets}
                documents={mandateDocuments}
                onEditTarget={handleEditTarget}
                onViewDocuments={handleViewDocuments}
              />
            </TabsContent>

            <TabsContent value="documents" className="h-full m-0 p-6">
              <MandatoDocs mandateId={mandateId!} />
            </TabsContent>

            <TabsContent value="activity" className="h-full m-0 p-6">
              <MandatoActivityLog mandateId={mandateId!} />
            </TabsContent>

            <TabsContent value="criteria" className="h-full m-0 p-6">
              <MandatoCriteria mandate={mandate} />
            </TabsContent>

            <TabsContent value="configuration" className="h-full m-0 p-6">
              <MandatoConfig mandate={mandate} />
            </TabsContent>

            <TabsContent value="client-access" className="h-full m-0 p-6">
              <MandatoClientAccess mandateId={mandateId!} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Target Detail Panel */}
      <TargetDetailPanel
        target={selectedTarget}
        documents={mandateDocuments}
        open={showTargetDetail}
        onOpenChange={setShowTargetDetail}
        onTargetUpdate={(updatedTarget) => {
          setSelectedTarget(updatedTarget);
          if (mandateId) loadMandateData.current(mandateId);
        }}
        onDocumentUploaded={() => {
          if (mandateId) loadMandateData.current(mandateId);
        }}
      />
    </div>
  );
}