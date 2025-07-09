import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import MinimalTransacciones from '@/pages/MinimalTransacciones';

export default function MandatesPage() {
  const [activeTab, setActiveTab] = useState('compra');

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mandatos</h1>
            <p className="text-muted-foreground">
              Gestiona todos los mandatos de compra y venta
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compra" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Mandatos de Compra
            </TabsTrigger>
            <TabsTrigger value="venta" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mandatos de Venta
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="compra" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Mandatos de búsqueda de empresas para adquisición
            </div>
            <HierarchicalCRMView initialLevel="mandates" mandateType="compra" />
          </TabsContent>
          
          <TabsContent value="venta" className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Transacciones de venta y operaciones comerciales
            </div>
            <MinimalTransacciones />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}