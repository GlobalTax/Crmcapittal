
import { CheckCircle } from "lucide-react";
import { Operation } from "@/types/Operation";

interface OperationInfoProps {
  operation: Operation;
}

export const OperationInfo = ({ operation }: OperationInfoProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <p className="font-medium">{operation.company_name}</p>
      <p className="text-sm text-gray-600">{operation.sector}</p>
      {operation.teaser_url && (
        <div className="mt-2 flex items-center space-x-1 text-green-600 text-sm">
          <CheckCircle className="h-3 w-3" />
          <span>Teaser actual disponible</span>
        </div>
      )}
    </div>
  );
};
