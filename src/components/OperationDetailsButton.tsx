
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OperationDetailsButtonProps {
  operationId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const OperationDetailsButton = ({ 
  operationId, 
  variant = "outline", 
  size = "sm" 
}: OperationDetailsButtonProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/operation/${operationId}`);
  };

  return (
    <Button variant={variant} size={size} onClick={handleViewDetails}>
      <Eye className="h-4 w-4 mr-1" />
      Ver Detalles
    </Button>
  );
};
