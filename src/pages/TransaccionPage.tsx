import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TransaccionHeader } from '@/components/transacciones/TransaccionHeader';
import { TransaccionOverviewTab } from '@/components/transacciones/tabs/TransaccionOverviewTab';
import { TransaccionActivityTab } from '@/components/transacciones/tabs/TransaccionActivityTab';
import { TransaccionTasksTab } from '@/components/transacciones/tabs/TransaccionTasksTab';
import { TransaccionPeopleTab } from '@/components/transacciones/tabs/TransaccionPeopleTab';
import { TransaccionNotesTab } from '@/components/transacciones/tabs/TransaccionNotesTab';
import { TransaccionDocumentsTab } from '@/components/transacciones/tabs/TransaccionDocumentsTab';
import { TransaccionInteresadosTab } from '@/components/transacciones/tabs/TransaccionInteresadosTab';
import { TransaccionTeaserTab } from '@/components/transacciones/tabs/TransaccionTeaserTab';
import { TransaccionDetailsSidebar } from '@/components/transacciones/TransaccionDetailsSidebar';
import { useTransaccion } from '@/hooks/useTransaccion';
import { useTransacciones } from '@/hooks/useTransacciones';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function TransaccionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { transaccion, isLoading: transaccionLoading, updateTransaccion } = useTransaccion(id || '');
  const { transacciones, loading: transaccionesLoading } = useTransacciones();
  
  const isLoading = transaccionLoading || transaccionesLoading;

  // Handle legacy URL redirections
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const drawerId = searchParams.get('drawer');
    if (drawerId && drawerId !== id) {
      navigate(`/transacciones/${drawerId}`, { replace: true });
    }
  }, [location.search, id, navigate]);

  // Set document title and handle not found
  useEffect(() => {
    if (transaccion) {
      document.title = `Transacción • ${transaccion.nombre_transaccion}`;
    } else if (!isLoading && id) {
      // Transacción not found, redirect to transactions list
      navigate('/transacciones', { replace: true });
    }
  }, [transaccion, id, navigate, isLoading]);

  // Scroll to top when transaction changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Clean up document title on unmount
  useEffect(() => {
    return () => {
      document.title = 'Transacciones';
    };
  }, []);

  // Navigation between transactions
  const getCurrentTransaccionIndex = () => {
    if (!transacciones || !transaccion) return -1;
    return transacciones.findIndex(t => t.id === transaccion.id);
  };

  const handlePrevious = () => {
    if (!transacciones) return;
    const currentIndex = getCurrentTransaccionIndex();
    if (currentIndex > 0) {
      const previousTransaccion = transacciones[currentIndex - 1];
      navigate(`/transacciones/${previousTransaccion.id}`);
    }
  };

  const handleNext = () => {
    if (!transacciones) return;
    const currentIndex = getCurrentTransaccionIndex();
    if (currentIndex < transacciones.length - 1) {
      const nextTransaccion = transacciones[currentIndex + 1];
      navigate(`/transacciones/${nextTransaccion.id}`);
    }
  };

  const currentIndex = getCurrentTransaccionIndex();
  const hasPrevious = currentIndex > 0;
  const hasNext = transacciones ? currentIndex < transacciones.length - 1 : false;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!transaccion) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Transacción no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-0 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TransaccionHeader
          transaccion={transaccion}
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
                <TabsTrigger 
                  value="interesados"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Interesados
                </TabsTrigger>
                <TabsTrigger 
                  value="teaser"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 text-sm whitespace-nowrap"
                >
                  Teaser
                </TabsTrigger>
              </div>
            </TabsList>

            {/* Tab Content */}
            <div className="flex">
              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="overview" className="mt-0 p-6">
                  <TransaccionOverviewTab transaccion={transaccion} />
                </TabsContent>
                
                <TabsContent value="activity" className="mt-0 p-6">
                  <TransaccionActivityTab transaccion={transaccion} />
                </TabsContent>
                
                <TabsContent value="documents" className="mt-0 p-6">
                  <TransaccionDocumentsTab transaccion={transaccion} />
                </TabsContent>
                
                <TabsContent value="tasks" className="mt-0 p-6">
                  <TransaccionTasksTab transaccion={transaccion} />
                </TabsContent>
                
                <TabsContent value="people" className="mt-0 p-6">
                  <TransaccionPeopleTab transaccion={transaccion} />
                </TabsContent>
                
                <TabsContent value="notes" className="mt-0 p-6">
                  <TransaccionNotesTab transaccion={transaccion} />
                </TabsContent>
                
                <TabsContent value="interesados" className="mt-0 p-6">
                  <TransaccionInteresadosTab transaccionId={transaccion.id} />
                </TabsContent>
                
                <TabsContent value="teaser" className="mt-0 p-6">
                  <TransaccionTeaserTab transaccion={transaccion} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 border-l border-border bg-neutral-50 overflow-y-auto">
        <TransaccionDetailsSidebar transaccion={transaccion} onUpdate={updateTransaccion} />
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
            <h2 className="text-lg font-semibold">Detalles de la Transacción</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('overview')}
            >
              ×
            </Button>
          </div>
          <TransaccionDetailsSidebar transaccion={transaccion} onUpdate={updateTransaccion} />
        </div>
      )}
    </div>
  );
}