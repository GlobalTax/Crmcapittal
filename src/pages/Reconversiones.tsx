import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReconversionsList } from '@/components/reconversiones/ReconversionsList';
import { useReconversions } from '@/hooks/useReconversions';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import type { Database } from '@/integrations/supabase/types';

type Reconversion = Database['public']['Tables']['reconversiones_new']['Row'];

export default function Reconversiones() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as string,
    priority: 'all' as string,
    assignedTo: 'all' as string
  });

  const { reconversiones, loading, error, createReconversion, updateReconversion, fetchReconversiones } = useReconversions();
  const queryClient = useQueryClient();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['reconversiones'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [queryClient]);

  // Filter reconversiones based on current filters
  const filteredReconversiones = reconversiones.filter(reconversion => {
    const matchesSearch = !filters.search || 
      reconversion.company_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      reconversion.contact_name?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || reconversion.estado === filters.status;
    const matchesAssigned = filters.assignedTo === 'all' || reconversion.assigned_to === filters.assignedTo;

    return matchesSearch && matchesStatus && matchesAssigned;
  });

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'all'
  );

  const handleReconversionSelect = (reconversionId: string) => {
    navigate(`/reconversiones/${reconversionId}`);
  };

  const handleBackToList = () => {
    navigate('/reconversiones');
  };

  const handleCreateNew = () => {
    // Esta función será llamada para abrir el diálogo de creación
    console.log('Crear nueva reconversión');
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      priority: 'all',
      assignedTo: 'all'
    });
  };

  const handleRefresh = () => {
    fetchReconversiones();
  };

  const handleUpdateStatus = async (reconversionId: string, status: string) => {
    return await updateReconversion(reconversionId, { estado: status as any });
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
        <ReconversionsList
          reconversiones={reconversiones}
          loading={loading}
          error={error}
          viewMode={viewMode}
          filters={filters as any}
          filteredReconversiones={filteredReconversiones}
          hasActiveFilters={hasActiveFilters}
          onViewModeChange={setViewMode}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onView={(reconversion) => handleReconversionSelect(reconversion.id)}
          onCreateNew={handleCreateNew}
          onRefresh={handleRefresh}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </ErrorBoundary>
  );
}