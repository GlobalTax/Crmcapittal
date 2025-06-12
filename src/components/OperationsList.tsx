
import { Operation } from "@/types/Operation";
import { OperationsGrid } from "./OperationsGrid";
import { OperationsEmptyState } from "./OperationsEmptyState";

interface OperationsListProps {
  operations: Operation[];
  loading?: boolean;
  error?: string | null;
}

export const OperationsList = ({ operations, loading, error }: OperationsListProps) => {
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
      <h2 className="text-xl font-semibold text-black">Operaciones Disponibles</h2>
      <OperationsGrid operations={operations} />
    </div>
  );
};
