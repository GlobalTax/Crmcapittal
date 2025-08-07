import React from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { TransaccionesProductivityHeader } from '@/components/transacciones/productivity/TransaccionesProductivityHeader';
import { HybridTransaccionesList } from '@/components/transacciones/productivity/HybridTransaccionesList';

export default function OptimizedTransaccionesPage() {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <TransaccionesProductivityHeader />
              <HybridTransaccionesList />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}