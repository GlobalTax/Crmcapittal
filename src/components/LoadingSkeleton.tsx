
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type?: 'operation-card' | 'table-row' | 'contact-card' | 'dashboard-card' | 'kanban-column' | 'lead-table-row';
  count?: number;
}

export const LoadingSkeleton = ({ type = 'operation-card', count = 1 }: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'operation-card':
        return (
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-2 mb-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        );

      case 'table-row':
        return (
          <div className="flex items-center space-x-4 p-4 border-b border-gray-100">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        );

      case 'lead-table-row':
        return (
          <tr className="border-b border-gray-100">
            <td className="p-4"><Skeleton className="h-4 w-32" /></td>
            <td className="p-4"><Skeleton className="h-4 w-40" /></td>
            <td className="p-4"><Skeleton className="h-4 w-24" /></td>
            <td className="p-4"><Skeleton className="h-4 w-20" /></td>
            <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
            <td className="p-4"><Skeleton className="h-8 w-20 rounded" /></td>
            <td className="p-4">
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </td>
            <td className="p-4"><Skeleton className="h-4 w-16" /></td>
            <td className="p-4"><Skeleton className="h-8 w-8 rounded" /></td>
          </tr>
        );

      case 'contact-card':
        return (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        );

      case 'dashboard-card':
        return (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        );

      case 'kanban-column':
        return (
          <div className="flex-shrink-0 w-80">
            <div className="bg-slate-100 rounded-lg p-3 min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-8 rounded-full" />
              </div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2 mb-2" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <Skeleton className="h-20 w-full" />;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

// Componentes específicos optimizados
export const OperationsLoadingSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <LoadingSkeleton type="operation-card" count={count} />
  </div>
);

export const TableLoadingSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="bg-white rounded-lg border border-gray-200">
    <LoadingSkeleton type="table-row" count={count} />
  </div>
);

export const LeadsTableSkeleton = ({ count = 5 }: { count?: number }) => (
  <tbody>
    {Array.from({ length: count }).map((_, index) => (
      <LoadingSkeleton key={index} type="lead-table-row" count={1} />
    ))}
  </tbody>
);

export const DashboardLoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* KPI Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LoadingSkeleton type="dashboard-card" count={4} />
      </div>
      
      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
          
          {/* Recent Deals Skeleton */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Activity & Actions */}
        <div className="space-y-6">
          {/* Activity Feed Skeleton */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Actions Skeleton */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
