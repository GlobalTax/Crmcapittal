
import { Operation } from "@/types/Operation";
import { OperationCard } from "./OperationCard";

interface OperationsGridProps {
  operations: Operation[];
  onToggleFavorite: (operationId: string) => void;
  isFavorite: (operationId: string) => boolean;
}

export const OperationsGrid = ({ operations }: OperationsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {operations.map((operation) => (
        <OperationCard key={operation.id} operation={operation} />
      ))}
    </div>
  );
};
