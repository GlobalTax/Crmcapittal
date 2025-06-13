
import { Operation } from "@/types/Operation";
import { OperationCard } from "./OperationCard";

interface OperationsGridProps {
  operations: Operation[];
  onToggleFavorite: (operationId: string) => void;
  isFavorite: (operationId: string) => boolean;
}

export const OperationsGrid = ({ operations }: OperationsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {operations.map((operation) => (
        <OperationCard key={operation.id} operation={operation} />
      ))}
    </div>
  );
};
