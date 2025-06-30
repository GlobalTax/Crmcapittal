
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Deal } from "@/types/Deal";

interface DealHeaderProps {
  deal: Deal;
  onEdit: () => void;
}

export const DealHeader = ({ deal, onEdit }: DealHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Link to="/deals">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{deal.deal_name}</h1>
          <p className="text-gray-600 capitalize">{deal.deal_type}</p>
        </div>
      </div>
      <Button onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Editar Deal
      </Button>
    </div>
  );
};
