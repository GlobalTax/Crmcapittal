import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { TransactionInlineStats } from '@/components/transacciones/TransactionInlineStats';
import { QuickFilterTabs } from '@/components/transacciones/QuickFilterTabs';
import { UltraHybridTransactionsTable } from '@/components/transacciones/UltraHybridTransactionsTable';
import { useTransaccionesOptimized, TransaccionFilters } from '@/hooks/useTransaccionesOptimized';

export default function MinimalTransacciones() {
  const [filters, setFilters] = useState<TransaccionFilters>({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value_desc');

  const { 
    filteredTransacciones, 
    stats, 
    isLoading, 
    error 
  } = useTransaccionesOptimized(filters);

  const handleFilterClick = (filterType: string) => {
    setActiveFilter(filterType);
    
    // Apply filters based on type
    const newFilters: TransaccionFilters = {};
    
    switch (filterType) {
      case 'closing_soon':
        newFilters.quickFilter = 'closing_soon';
        break;
      case 'at_risk':
        newFilters.quickFilter = 'high_value';
        break;
      case 'completed':
        newFilters.quickFilter = 'inactive';
        break;
      case 'mine':
        newFilters.owner = 'current_user';
        break;
      default:
        // 'all' - no filters
        break;
    }
    
    setFilters(newFilters);
  };

  const handleFilterChange = (filter: string) => {
    handleFilterClick(filter);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    // Sort logic would be implemented in the hook
  };

  const handleStageChange = (transactionId: string, stageId: string) => {
    // TODO: Implement stage change API call
    console.log('Stage change:', { transactionId, stageId });
  };

  const handleUpdate = (transactionId: string) => {
    // TODO: Open update modal or form
    console.log('Update transaction:', transactionId);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando transacciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Transacciones</h1>
                <TransactionInlineStats 
                  stats={stats} 
                  onFilterClick={handleFilterClick} 
                />
              </div>
              
              <QuickFilterTabs
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
              
              <UltraHybridTransactionsTable
                transacciones={filteredTransacciones}
                onStageChange={handleStageChange}
                onUpdate={handleUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}