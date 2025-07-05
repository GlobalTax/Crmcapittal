import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DealHeader } from '@/components/deals/DealHeader';
import { DealOverviewTab } from '@/components/deals/DealOverviewTab';
import { DealActivityTab } from '@/components/deals/DealActivityTab';
import { DealDetailsSidebar } from '@/components/deals/DealDetailsSidebar';
import { DealTasksTab } from '@/components/deals/tabs/DealTasksTab';
import { DealPeopleTab } from '@/components/deals/tabs/DealPeopleTab';
import { DealNotesTab } from '@/components/deals/tabs/DealNotesTab';
import { DealDocumentsTab } from '@/components/deals/tabs/DealDocumentsTab';
import { useDeal } from '@/hooks/useDeal';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { useDeals } from '@/hooks/useDeals';

export default function DealPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { deal, isLoading: dealLoading, updateDeal } = useDeal(id || '');
  const { deals, loading: dealsLoading } = useDeals();
  
  const isLoading = dealLoading || dealsLoading;

  // Handle legacy URL redirections
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId && drawerId !== id) {
      navigate(`/deals/${drawerId}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Encontrar la oportunidad y establecer título del documento
  useEffect(() => {
    if (deal) {
      document.title = `Oportunidad • ${deal.title}`;
    } else if (!isLoading && id) {
      // Oportunidad no encontrada, redirigir a lista de oportunidades
      navigate('/deals', { replace: true });
    }
  }, [deal, id, navigate, isLoading]);

  // Scroll to top when deal changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Oportunidades';
    };
  }, []);

  // Navigation between deals
  const getCurrentDealIndex = () => {
    if (!deals || !deal) return -1;
    return deals.findIndex(d => d.id === deal.id);
  };

  const handlePrevious = () => {
    if (!deals) return;
    const currentIndex = getCurrentDealIndex();
    if (currentIndex > 0) {
      const previousDeal = deals[currentIndex - 1];
      navigate(`/deals/${previousDeal.id}`);
    }
  };

  const handleNext = () => {
    if (!deals) return;
    const currentIndex = getCurrentDealIndex();
    if (currentIndex < deals.length - 1) {
      const nextDeal = deals[currentIndex + 1];
      navigate(`/deals/${nextDeal.id}`);
    }
  };

  const currentIndex = getCurrentDealIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = deals ? currentIndex < deals.length - 1 : false;

  // Verificar si la oportunidad ha sido ganada
  const isWon = deal?.stage === 'Won';

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Oportunidad no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-0 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <DealHeader
          deal={deal}
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
                  value="activity"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Actividad
                </TabsTrigger>
                <TabsTrigger 
                  value="documents"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Documentos
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Tareas
                </TabsTrigger>
                <TabsTrigger 
                  value="people"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Personas
                </TabsTrigger>
                <TabsTrigger 
                  value="notes"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Notas
                </TabsTrigger>
                {/* Conditional Negocio tab if deal is won */}
                {isWon && (
                  <TabsTrigger 
                    value="negocio"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                  >
                    Negocio M&A
                  </TabsTrigger>
                )}
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="mt-0 p-6">
                  <DealOverviewTab deal={deal} />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 p-6">
                  <DealActivityTab deal={deal} />
                </TabsContent>
                
                <TabsContent value="documents" className="mt-0 p-6">
                  <DealDocumentsTab deal={deal} />
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-0 p-6">
                  <DealTasksTab deal={deal} />
                </TabsContent>
                
                <TabsContent value="people" className="mt-0 p-6">
                  <DealPeopleTab deal={deal} />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0 p-6">
                  <DealNotesTab deal={deal} />
                </TabsContent>

                {isWon && (
                  <TabsContent value="negocio" className="mt-0 p-6">
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Gestión de transacciones M&A próximamente</p>
                    </div>
                  </TabsContent>
                )}
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 border-l border-border bg-neutral-50 overflow-y-auto">
        <DealDetailsSidebar deal={deal} onUpdate={updateDeal} />
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
            <h2 className="text-lg font-semibold">Detalles de la Oportunidad</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ×
            </Button>
          </div>
          <DealDetailsSidebar deal={deal} onUpdate={updateDeal} />
        </div>
      )}
    </div>
  );
}