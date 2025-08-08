import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Search, TrendingUp, Briefcase, Target, Building2 } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { MandateCard } from './MandateCard';
import { MandateFilters } from './MandateFilters';
import { CreateMandateDialog } from './CreateMandateDialog';
import { PipelineViewToggle } from './PipelineViewToggle';
import { MandateKanban } from './MandateKanban';
import { useViewPreferences } from '@/hooks/useViewPreferences';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';

interface MandatesListProps {
  mandates: BuyingMandate[];
  onMandateSelect: (mandateId: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const MandatesList = ({ mandates, onMandateSelect, onRefresh, isLoading }: MandatesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const { mandateViewPreference, updateMandateViewPreference } = useViewPreferences();
  const { updateMandateStatus } = useBuyingMandates();

  // Filter mandates based on search and filters
  const filteredMandates = mandates.filter(mandate => {
    // Search filter
    const matchesSearch = !searchTerm || 
      mandate.mandate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mandate.other_criteria?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = !selectedFilters.status || mandate.status === selectedFilters.status;

    // Type filter
    const matchesType = !selectedFilters.mandate_type || mandate.mandate_type === selectedFilters.mandate_type;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleMandateCreated = () => {
    onRefresh();
  };

  const handleStatusUpdate = async (mandateId: string, status: BuyingMandate['status']) => {
    return await updateMandateStatus(mandateId, status);
  };

  const handleMandateEdit = (mandate: BuyingMandate) => {
    // Navigate to mandate detail for editing
    onMandateSelect(mandate.id);
  };

  const handleMandateView = (mandate: BuyingMandate) => {
    // Navigate to mandate detail
    onMandateSelect(mandate.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mandatos de Compra</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los mandatos de búsqueda de empresas para adquisición
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <CreateMandateDialog 
            onSuccess={handleMandateCreated}
            trigger={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Mandato
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mandatos</p>
                <p className="text-2xl font-bold text-foreground">{mandates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-foreground">
                  {mandates.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                <p className="text-2xl font-bold text-foreground">
                  {mandates.filter(m => m.status === 'active' || m.status === 'paused').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clientes Únicos</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(mandates.map(m => m.client_name)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search, Filters and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar mandatos por título, cliente o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <MandateFilters 
            filters={selectedFilters}
            onFiltersChange={setSelectedFilters}
            mandates={mandates}
          />
          <PipelineViewToggle
            currentView={mandateViewPreference}
            onViewChange={updateMandateViewPreference}
          />
        </div>
      </div>

      {/* Conditional View: Grid or Pipeline */}
      {mandateViewPreference === 'table' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMandates.map((mandate) => (
            <MandateCard 
              key={mandate.id}
              mandate={mandate}
              onSelect={() => onMandateSelect(mandate.id)}
            />
          ))}
        </div>
      ) : (
        <MandateKanban
          mandates={filteredMandates}
          onUpdateStatus={handleStatusUpdate}
          onEdit={handleMandateEdit}
          onView={handleMandateView}
          isLoading={isLoading}
          onRefresh={onRefresh}
        />
      )}

      {/* Empty state */}
      {filteredMandates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {mandates.length === 0 ? 'No hay mandatos creados' : 'No se encontraron mandatos'}
              </h3>
              <p className="text-sm">
                {mandates.length === 0 
                  ? 'Crea tu primer mandato de compra para comenzar'
                  : 'Intenta ajustar los filtros o el término de búsqueda'
                }
              </p>
              {mandates.length === 0 && (
                <CreateMandateDialog 
                  onSuccess={handleMandateCreated}
                  trigger={
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primer Mandato
                    </Button>
                  }
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MandatesList;