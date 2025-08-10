
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Operation } from "@/types/Operation";
import { getStatusColor, getStatusLabel } from "@/utils/operationHelpers";

interface OperationCardHeaderProps {
  operation: Operation;
  onToggleFavorite?: (operationId: string) => void;
  isFavorite?: (operationId: string) => boolean;
}

export const OperationCardHeader = ({ operation, onToggleFavorite, isFavorite }: OperationCardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-2">
        <div>
          <h3 className="font-semibold text-black text-base">{operation.company_name}</h3>
          <p className="text-black text-xs">{operation.sector}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={getStatusColor(operation.status)}>
          {getStatusLabel(operation.status)}
        </Badge>
        {onToggleFavorite && isFavorite && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(operation.id)}
            aria-label={isFavorite(operation.id) ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Star className={`h-4 w-4 ${isFavorite(operation.id) ? 'text-primary' : ''}`} />
          </Button>
        )}
      </div>
    </div>
  );
};
