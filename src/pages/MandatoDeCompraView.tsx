import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Upload, Download } from 'lucide-react';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { BuyingMandate, MandateTarget } from '@/types/BuyingMandate';
import { MandateHeader } from '@/components/mandates/MandateHeader';
import { TargetDataTable } from '@/components/mandates/TargetDataTable';
import { TargetFiltersPanel } from '@/components/mandates/TargetFiltersPanel';
import { DocumentUploader } from '@/components/mandates/DocumentUploader';
import { ImportFromCRMDialog } from '@/components/mandates/ImportFromCRMDialog';
import { TargetDetailPanel } from '@/components/mandates/TargetDetailPanel';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function MandatoDeCompraView() {
  const { mandateId } = useParams<{ mandateId: string }>();
  const [selectedTarget, setSelectedTarget] = useState<MandateTarget | null>(null);
  const [showTargetDetail, setShowTargetDetail] = useState(false);
  const [filteredTargets, setFilteredTargets] = useState<MandateTarget[]>([]);
  
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
  }, [mandateId]); // Solo depende de mandateId

  // Efecto separado y estable para filtros
  useEffect(() => {
    setFilteredTargets(mandateTargets);
  }, [mandateTargets.length]); // Solo depende de la longitud del array

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <MandateHeader 
        mandate={mandate}
        totalTargets={mandateTargets.length}
        contactedTargets={contactedTargets}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandateTargets.length}</div>
            <p className="text-xs text-muted-foreground">
              empresas identificadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{contactedTargets}</div>
            <p className="text-xs text-muted-foreground">
              {mandateTargets.length > 0 ? Math.round((contactedTargets / mandateTargets.length) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interesados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{interestedTargets}</div>
            <p className="text-xs text-muted-foreground">
              en proceso avanzado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mandateDocuments.length}</div>
            <p className="text-xs text-muted-foreground">
              archivos gestionados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <TargetFiltersPanel 
            targets={mandateTargets}
            onFilter={handleFilterTargets}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <ImportFromCRMDialog 
            mandateId={mandateId!}
            onImported={() => {
              if (mandateId) loadMandateData.current(mandateId);
            }}
            trigger={
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Importar desde CRM
              </Button>
            }
          />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Target Manual
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Targets del Mandato</CardTitle>
          <CardDescription>
            Gestiona y da seguimiento a todas las empresas objetivo de este mandato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TargetDataTable
            targets={filteredTargets}
            documents={mandateDocuments}
            onEditTarget={handleEditTarget}
            onViewDocuments={handleViewDocuments}
          />
        </CardContent>
      </Card>

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