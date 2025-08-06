import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewBuyingMandatesView from '@/pages/NewBuyingMandatesView';
import SellingMandates from '@/pages/SellingMandates';

export default function MandatesView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL params or default to 'compra'
  const activeTab = searchParams.get('tab') || 'compra';

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    setSearchParams(params);
  };

  // If we have an ID, show the specific mandate detail (buying mandates only for now)
  if (id) {
    return (
      <ErrorBoundary>
        <NewBuyingMandatesView />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Mandatos</h1>
            <p className="text-muted-foreground">
              Administra mandatos de compra y venta de empresas
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="compra">Mandatos de Compra</TabsTrigger>
            <TabsTrigger value="venta">Mandatos de Venta</TabsTrigger>
          </TabsList>

          <TabsContent value="compra" className="space-y-6">
            <NewBuyingMandatesView />
          </TabsContent>

          <TabsContent value="venta" className="space-y-6">
            <SellingMandates />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}