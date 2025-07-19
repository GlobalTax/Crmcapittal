
import { HierarchicalCRMView } from '@/components/unified/HierarchicalCRMView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { BuyingMandateTeaserModal } from '@/components/mandates/BuyingMandateTeaserModal';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Building2 } from 'lucide-react';

export default function BuyingMandates() {
  const [selectedMandateForTeaser, setSelectedMandateForTeaser] = useState<any>(null);
  const [showTeaserModal, setShowTeaserModal] = useState(false);

  const handleCreateTeaser = (mandate: any) => {
    setSelectedMandateForTeaser(mandate);
    setShowTeaserModal(true);
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mandatos de Compra</h1>
            <p className="text-muted-foreground">
              Gestiona los mandatos de búsqueda de empresas para adquisición
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Mandato
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar mandatos..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Mandatos</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Búsqueda activa</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa Éxito</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </CardContent>
          </Card>
        </div>

        <HierarchicalCRMView initialLevel="mandates" />

        {selectedMandateForTeaser && (
          <BuyingMandateTeaserModal
            mandate={selectedMandateForTeaser}
            open={showTeaserModal}
            onOpenChange={(open) => {
              setShowTeaserModal(open);
              if (!open) setSelectedMandateForTeaser(null);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
