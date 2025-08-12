import { useState, useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { ProductivityHeader } from '@/components/mandates/productivity/ProductivityHeader';
import { HybridMandatesList } from '@/components/mandates/productivity/HybridMandatesList';
import { MandatePipelineSidebar } from '@/components/mandates/productivity/MandatePipelineSidebar';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { BuyingMandate } from '@/types/BuyingMandate';
import { RevealSection } from '@/components/ui/RevealSection';

export default function OptimizedMandatesPage() {
  const { mandates, isLoading, fetchMandates } = useBuyingMandates();
  const [selectedMandate, setSelectedMandate] = useState<BuyingMandate | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMandates();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMandates]);

  // Initial load
  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  const handleMandateSelect = (mandate: BuyingMandate) => {
    setSelectedMandate(selectedMandate?.id === mandate.id ? null : mandate);
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  const handleRefresh = () => {
    fetchMandates();
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ProductivityHeader 
            mandates={mandates}
            filters={filters}
            searchTerm={searchTerm}
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
          
          <RevealSection storageKey="mandatos/hybrid-list" defaultCollapsed={true} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={mandates?.length}>
            <HybridMandatesList 
              mandates={mandates}
              filters={filters}
              searchTerm={searchTerm}
              selectedMandate={selectedMandate}
              onMandateSelect={handleMandateSelect}
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </RevealSection>
        </div>

        {/* Pipeline Sidebar */}
        <MandatePipelineSidebar 
          mandates={mandates}
          selectedMandate={selectedMandate}
        />
      </div>
    </ErrorBoundary>
  );
}