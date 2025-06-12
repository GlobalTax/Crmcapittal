
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Operation } from "@/types/Operation";
import { FavoriteButton } from "./FavoriteButton";

interface OperationCardActionsProps {
  operation: Operation;
}

export const OperationCardActions = ({ operation }: OperationCardActionsProps) => {
  const handleContact = () => {
    // TODO: Implement contact functionality
    console.log("Contact for operation:", operation.company_name);
  };

  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        <FavoriteButton operationId={operation.id} />
      </div>
      
      <Button 
        onClick={handleContact}
        size="sm" 
        className="bg-black hover:bg-gray-800 text-white"
      >
        Contactar
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};
