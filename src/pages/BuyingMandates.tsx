import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Target, TrendingUp } from 'lucide-react';
import { CreateMandateDialog } from '@/components/mandates/CreateMandateDialog';
import { MandatesTable } from '@/components/mandates/MandatesTable';
import { MandateTargetsDialog } from '@/components/mandates/MandateTargetsDialog';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { BuyingMandate } from '@/types/BuyingMandate';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function BuyingMandates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMandate, setSelectedMandate] = useState<BuyingMandate | null>(null);
  const [showTargetsDialog, setShowTargetsDialog] = useState(false);
  const { mandates, targets, isLoading, fetchMandates } = useBuyingMandates();

  // Fetch mandates on component mount
  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  const filteredMandates = mandates.filter(mandate =>
    mandate.mandate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mandate.target_sectors.some(sector => 
      sector.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleViewTargets = (mandate: BuyingMandate) => {
    setSelectedMandate(mandate);
    setShowTargetsDialog(true);
  };

  const activeCount = mandates.filter(m => m.status === 'active').length;
  const totalTargets = targets.length;
  const contactedTargets = targets.filter(t => t.contacted).length;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mandatos de Compra</h1>
            <p className="text-muted-foreground">
              Gestiona los mandatos de búsqueda de empresas para adquisición
            </p>
          </div>
          <CreateMandateDialog onSuccess={fetchMandates} />
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mandatos Activos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              de {mandates.length} totales
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTargets}</div>
            <p className="text-xs text-muted-foreground">
              empresas identificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactados</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactedTargets}</div>
            <p className="text-xs text-muted-foreground">
              {totalTargets > 0 ? Math.round((contactedTargets / totalTargets) * 100) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {targets.filter(t => ['in_analysis', 'interested', 'nda_signed'].includes(t.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              targets en proceso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Mandatos</CardTitle>
          <CardDescription>
            Lista de todos los mandatos de búsqueda activos y históricos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, cliente o sector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredMandates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No se encontraron mandatos que coincidan con la búsqueda' : 'No hay mandatos creados aún'}
              </p>
              {!searchTerm && (
                <CreateMandateDialog 
                  trigger={
                    <Button className="mt-4">
                      Crear Primer Mandato
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <MandatesTable 
              mandates={filteredMandates}
              onViewTargets={handleViewTargets}
            />
          )}
        </CardContent>
      </Card>

      {/* Targets Dialog */}
      <MandateTargetsDialog
        mandate={selectedMandate}
        open={showTargetsDialog}
        onOpenChange={(open) => {
          setShowTargetsDialog(open);
          if (!open) setSelectedMandate(null);
        }}
      />
      </div>
    </ErrorBoundary>
  );
}