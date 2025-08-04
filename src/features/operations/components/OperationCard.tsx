import { Operation } from "../types/Operation";
import { OperationCardHeader } from "./OperationCardHeader";
import { OperationCardContent } from "./OperationCardContent";
import { OperationCardActions } from "./OperationCardActions";

interface OperationCardProps {
  operation: Operation;
}

export const OperationCard = ({ operation }: OperationCardProps) => {
  return (
    <div className="border border-gray-200 bg-white p-4 space-y-4">
      <div className="pb-2">
        <OperationCardHeader operation={operation} />
      </div>
      
      <div className="space-y-4">
        <OperationCardContent operation={operation} />
        <OperationCardActions operation={operation} />
      </div>
    </div>
  );
};