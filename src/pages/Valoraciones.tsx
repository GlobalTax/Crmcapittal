
import React, { Suspense } from 'react';

// Lazy load the heavy component
const OptimizedValoracionesList = React.lazy(() => 
  import('@/components/valoraciones/OptimizedValoracionesList').then(module => ({
    default: module.OptimizedValoracionesList
  }))
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export default function Valoraciones() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Valoraciones</h1>
            <p className="text-muted-foreground">
              Gestiona y consulta las valoraciones de empresas de forma optimizada
            </p>
          </div>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <OptimizedValoracionesList />
        </Suspense>
      </div>
    </div>
  );
}
