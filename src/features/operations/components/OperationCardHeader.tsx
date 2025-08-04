import { Badge } from "@/components/ui/badge";
import { Operation } from "../types/Operation";
import { getStatusColor, getStatusLabel } from "@/utils/operationHelpers";

interface OperationCardHeaderProps {
  operation: Operation;
}

export const OperationCardHeader = ({ operation }: OperationCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <div>
          <h3 className="font-semibold text-black text-base">{operation.company_name}</h3>
          <p className="text-black text-xs">{operation.sector}</p>
        </div>
      </div>
      <Badge className={getStatusColor(operation.status)}>
        {getStatusLabel(operation.status)}
      </Badge>
    </div>
  );
};