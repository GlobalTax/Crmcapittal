import React, { Suspense } from 'react';
import { useLazyTabData } from '@/hooks/useLazyTabData';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadsTable } from './tables/LeadsTable';
import { CompaniesTable } from './tables/CompaniesTable';
import { MandatesTable } from './tables/MandatesTable';
import { TargetsTable } from './tables/TargetsTable';

type CRMTabType = 'leads' | 'companies' | 'mandates' | 'targets';

interface CRMTabContentProps {
  type: CRMTabType;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-9 w-24" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  </div>
);

export const CRMTabContent: React.FC<CRMTabContentProps> = ({ type }) => {
  const { data, isLoading, error } = useLazyTabData(type);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Error al cargar los datos</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Suspense fallback={<LoadingSkeleton />}>
        {type === 'leads' && <LeadsTable data={data as any[]} />}
        {type === 'companies' && <CompaniesTable data={data as any[]} />}
        {type === 'mandates' && <MandatesTable data={data as any[]} />}
        {type === 'targets' && <TargetsTable data={data as any[]} />}
      </Suspense>
    </div>
  );
};