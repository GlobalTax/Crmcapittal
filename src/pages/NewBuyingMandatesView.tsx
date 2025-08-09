import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import MandatesList from '@/components/mandates/MandatesList';
import { MandateDetail } from '@/components/mandates/MandateDetail';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';

export default function NewBuyingMandatesView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mandates, isLoading, fetchMandates } = useBuyingMandates();

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

  const handleMandateSelect = (mandateId: string) => {
    navigate(`/mandatos/${mandateId}`);
  };

  const handleBackToList = () => {
    navigate('/mandatos');
  };

  if (isLoading && mandates.length === 0) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando mandatos...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col min-h-0 max-w-none w-full space-y-6">
        {!id ? (
          <MandatesList 
            mandates={mandates}
            onMandateSelect={handleMandateSelect}
            onRefresh={() => fetchMandates()}
            isLoading={isLoading}
          />
        ) : (
          <MandateDetail 
            mandateId={id}
            mandates={mandates}
            onBackToList={handleBackToList}
            onRefresh={() => fetchMandates()}
            isLoading={isLoading}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}