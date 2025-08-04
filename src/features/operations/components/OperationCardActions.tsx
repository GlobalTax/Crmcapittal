import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Operation } from "../types/Operation";

interface OperationCardActionsProps {
  operation: Operation;
}

export const OperationCardActions = ({ operation }: OperationCardActionsProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/operation/${operation.id}`);
  };

  return (
    <div className="flex gap-2 pt-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex-1 text-xs"
        onClick={handleViewDetails}
      >
        <Eye className="h-3 w-3 mr-1" />
        Ver Detalles
      </Button>
    </div>
  );
};