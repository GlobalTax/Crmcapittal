import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Target, FileText, Calendar, MapPin, Settings, Lock, TrendingUp } from 'lucide-react';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { MandateDashboardHeader } from '@/components/mandates/MandateDashboardHeader';
import { MandateKPIRow } from '@/components/mandates/MandateKPIRow';
import { MandateTargetsPipeline } from '@/components/mandates/MandateTargetsPipeline';
import { TargetDataTable } from '@/components/mandates/TargetDataTable';
import { TargetFiltersPanel } from '@/components/mandates/TargetFiltersPanel';
import { TargetDetailPanel } from '@/components/mandates/TargetDetailPanel';
import { MandateActivityTimeline } from '@/components/mandates/MandateActivityTimeline';
import { MandateCriteriaPanel } from '@/components/mandates/MandateCriteriaPanel';
import { MandateConfigurationPanel } from '@/components/mandates/MandateConfigurationPanel';
import { MandateClientAccessPanel } from '@/components/mandates/MandateClientAccessPanel';

export default function MandatoDashboardView() {
  const { mandateId } = useParams<{ mandateId: string }>();
  const [selectedTarget, setSelectedTarget] = useState<MandateTarget | null>(null);
  const [showTargetDetail, setShowTargetDetail] = useState(false);
  const [filteredTargets, setFilteredTargets] = useState<MandateTarget[]>([]);
  const [activeTab, setActiveTab] = useState('targets');
  const [viewMode, setViewMode] = useState<'table' | 'pipeline'>('table');
  
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

  // Efecto separado y estable para filtros
  useEffect(() => {
    setFilteredTargets(mandateTargets);
  }, [mandateTargets.length]);

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

  const handleFilterTargets = (filtered: MandateTarget[]) => {
    setFilteredTargets(filtered);
  };

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
        <MandateKPIRow 
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
            <TabsContent value="targets" className="h-full m-0 p-6 space-y-6">
              {/* Filters and View Toggle */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <TargetFiltersPanel 
                    targets={mandateTargets}
                    onFilter={handleFilterTargets}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as 'table' | 'pipeline')}
                    className="px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="table">Vista Tabla</option>
                    <option value="pipeline">Vista Pipeline</option>
                  </select>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'table' ? (
                <Card>
                  <CardContent className="p-6">
                    <TargetDataTable
                      targets={filteredTargets}
                      documents={mandateDocuments}
                      onEditTarget={handleEditTarget}
                      onViewDocuments={handleViewDocuments}
                    />
                  </CardContent>
                </Card>
              ) : (
                <MandateTargetsPipeline
                  targets={filteredTargets}
                  documents={mandateDocuments}
                  onTargetClick={handleViewDocuments}
                />
              )}
            </TabsContent>

            <TabsContent value="documents" className="h-full m-0 p-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground">
                    Panel de documentos - En desarrollo
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="h-full m-0 p-6">
              <MandateActivityTimeline mandateId={mandateId!} />
            </TabsContent>

            <TabsContent value="criteria" className="h-full m-0 p-6">
              <MandateCriteriaPanel mandate={mandate} />
            </TabsContent>

            <TabsContent value="configuration" className="h-full m-0 p-6">
              <MandateConfigurationPanel mandate={mandate} />
            </TabsContent>

            <TabsContent value="client-access" className="h-full m-0 p-6">
              <MandateClientAccessPanel mandateId={mandateId!} />
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