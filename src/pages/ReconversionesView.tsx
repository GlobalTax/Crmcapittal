import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ReconversionsList } from '@/components/reconversiones/ReconversionsList';
import { ReconversionDetail } from '@/components/reconversiones/ReconversionDetail';
import { useReconversiones } from '@/hooks/useReconversiones';
import type { ReconversionFilters, Reconversion } from '@/types/Reconversion';
import type { Database } from '@/integrations/supabase/types';


type DatabaseReconversion = Database['public']['Tables']['reconversiones']['Row'];

export default function ReconversionesView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reconversiones, loading, createReconversion, updateReconversion, deleteReconversion, refetch } = useReconversiones();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filters, setFilters] = useState<ReconversionFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    sector: 'all',
    investmentRange: {},
    createdDateRange: {}
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Remove refetch dependency to prevent infinite loop

  // The hook already fetches on mount, no need for additional useEffect

  const handleReconversionSelect = (reconversion: any) => {
    navigate(`/reconversiones/${reconversion.id}`);
  };

  const handleBackToList = () => {
    navigate('/reconversiones');
  };

  // Filter reconversions based on current filters - use original database type
  const filteredReconversiones = reconversiones.filter(reconversion => {
    if (filters.search && !reconversion.company_name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !reconversion.contact_name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status !== 'all' && reconversion.status !== filters.status) {
      return false;
    }
    if (filters.assignedTo !== 'all' && reconversion.assigned_to !== filters.assignedTo) {
      return false;
    }
    return true;
  });

  const handleFiltersChange = (newFilters: ReconversionFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      assignedTo: 'all',
      sector: 'all',
      investmentRange: {},
      createdDateRange: {}
    });
  };

  if (loading && reconversiones.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando reconversiones...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {!id ? (
          <ReconversionsList
            reconversiones={filteredReconversiones as any}
            loading={loading}
            error={null}
            viewMode={viewMode}
            filters={filters}
            filteredReconversiones={filteredReconversiones as any}
            hasActiveFilters={filters.search !== '' || filters.status !== 'all' || filters.assignedTo !== 'all'}
            onViewModeChange={setViewMode}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            onView={handleReconversionSelect}
            onCreateNew={() => {}}
            onRefresh={refetch}
            onUpdateStatus={(id, status) => updateReconversion(id, { status })}
          />
        ) : (
          <ReconversionDetail 
            reconversionId={id}
            reconversiones={filteredReconversiones as any[]}
            onBackToList={handleBackToList}
            onRefresh={refetch}
            isLoading={loading}
            onUpdate={updateReconversion}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}