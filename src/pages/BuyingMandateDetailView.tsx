import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BuyingMandateHeader } from '@/components/mandates/BuyingMandateHeader';
import { BuyingMandateOverviewTab } from '@/components/mandates/tabs/BuyingMandateOverviewTab';
import { BuyingMandateTargetsTab } from '@/components/mandates/tabs/BuyingMandateTargetsTab';
import { BuyingMandateDocumentsTab } from '@/components/mandates/tabs/BuyingMandateDocumentsTab';
import { BuyingMandateActivityTab } from '@/components/mandates/tabs/BuyingMandateActivityTab';
import { BuyingMandateDetailsSidebar } from '@/components/mandates/BuyingMandateDetailsSidebar';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { useMandatoById } from '@/hooks/useMandatoById';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function BuyingMandateDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { 
    mandates, 
    targets, 
    documents, 
    fetchMandates, 
    fetchTargets, 
    fetchDocuments,
    isLoading: mandatesLoading,
    updateMandateStatus 
  } = useBuyingMandates();
  
  const { mandate, loading: mandateLoading, error } = useMandatoById(id || '');
  
  const isLoading = mandateLoading || mandatesLoading;

  // Load related data when mandate is available
  useEffect(() => {
    if (id && mandate) {
      fetchTargets(id);
      fetchDocuments(id);
    }
  }, [id, mandate, fetchTargets, fetchDocuments]);

  // Set document title and handle not found
  useEffect(() => {
    if (mandate) {
      document.title = `Mandato • ${mandate.mandate_name}`;
    } else if (!isLoading && id) {
      // Mandate not found, redirect to mandates list
      navigate('/mandatos', { replace: true });
    }
  }, [mandate, id, navigate, isLoading]);

  // Scroll to top when mandate changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Mandatos de Compra';
    };
  }, []);

  // Navigation between mandates
  const getCurrentMandateIndex = () => {
    if (!mandates || !mandate) return -1;
    return mandates.findIndex(m => m.id === mandate.id);
  };

  const handlePrevious = () => {
    if (!mandates) return;
    const currentIndex = getCurrentMandateIndex();
    if (currentIndex > 0) {
      const previousMandate = mandates[currentIndex - 1];
      navigate(`/mandatos/${previousMandate.id}/detalle`);
    }
  };

  const handleNext = () => {
    if (!mandates) return;
    const currentIndex = getCurrentMandateIndex();
    if (currentIndex < mandates.length - 1) {
      const nextMandate = mandates[currentIndex + 1];
      navigate(`/mandatos/${nextMandate.id}/detalle`);
    }
  };

  const currentIndex = getCurrentMandateIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = mandates ? currentIndex < mandates.length - 1 : false;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !mandate) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">Mandato no encontrado</p>
          <Button variant="outline" className="mt-2" onClick={() => navigate('/mandatos')}>
            Volver a Mandatos
          </Button>
        </div>
      </div>
    );
  }

  const mandateTargets = targets.filter(target => target.mandate_id === id);
  const mandateDocuments = documents.filter(doc => doc.mandate_id === id);

  return (
    <div className="min-h-screen bg-neutral-0 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <BuyingMandateHeader
          mandate={mandate}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />

        {/* Tabs Navigation */}
        <div className="border-b border-border bg-background">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-auto p-0 bg-transparent">
              <div className="flex overflow-x-auto">
                <TabsTrigger 
                  value="overview"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Resumen
                </TabsTrigger>
                <TabsTrigger 
                  value="targets"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Targets ({mandateTargets.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="documents"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Documentos ({mandateDocuments.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="activity"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Actividad
                </TabsTrigger>
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="mt-0 p-6">
                  <BuyingMandateOverviewTab mandate={mandate} targets={mandateTargets} />
                </TabsContent>
                
                <TabsContent value="targets" className="mt-0 p-6">
                  <BuyingMandateTargetsTab 
                    mandate={mandate} 
                    targets={mandateTargets}
                    onTargetUpdate={() => {
                      if (id) fetchTargets(id);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="documents" className="mt-0 p-6">
                  <BuyingMandateDocumentsTab 
                    mandate={mandate} 
                    documents={mandateDocuments}
                    onDocumentUpdate={() => {
                      if (id) fetchDocuments(id);
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 p-6">
                  <BuyingMandateActivityTab mandate={mandate} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 border-l border-border bg-neutral-50 overflow-y-auto">
        <BuyingMandateDetailsSidebar 
          mandate={mandate} 
          targets={mandateTargets}
          onUpdate={updateMandateStatus} 
        />
      </div>

      {/* Mobile Details Button */}
      <div className="fixed bottom-4 right-4 lg:hidden">
        <Button
          onClick={() => setActiveTab(activeTab === 'details' ? 'overview' : 'details')}
          className="rounded-full shadow-lg"
        >
          {activeTab === 'details' ? 'Cerrar Detalles' : 'Mostrar Detalles'}
        </Button>
      </div>

      {/* Mobile Details Panel */}
      {activeTab === 'details' && (
        <div className="fixed inset-0 bg-background z-50 lg:hidden overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Detalles del Mandato</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ×
            </Button>
          </div>
          <BuyingMandateDetailsSidebar 
            mandate={mandate} 
            targets={mandateTargets}
            onUpdate={updateMandateStatus} 
          />
        </div>
      )}
    </div>
  );
}