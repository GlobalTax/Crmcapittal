
import { useState } from "react";
import { Operation } from "@/types/Operation";
import { OperationsGrid } from "./OperationsGrid";
import { OperationsTable } from "./OperationsTable";
import { OperationsViewToggle } from "./OperationsViewToggle";
import { OperationsEmptyState } from "./OperationsEmptyState";

interface OperationsListProps {
  operations: Operation[];
  loading?: boolean;
  error?: string | null;
}

export const OperationsList = ({ operations, loading, error }: OperationsListProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const hasOperations = operations.length > 0;

  if (loading || error || !hasOperations) {
    return (
      <OperationsEmptyState 
        loading={loading} 
        error={error} 
        hasOperations={hasOperations} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-black">Operaciones Disponibles</h2>
        <OperationsViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      
      {viewMode === 'grid' ? (
        <OperationsGrid operations={operations} />
      ) : (
        <div className="bg-white rounded-[10px] overflow-hidden" style={{ border: '0.5px solid black' }}>
          <OperationsTable operations={operations} />
        </div>
      )}
    </div>
  );
};
