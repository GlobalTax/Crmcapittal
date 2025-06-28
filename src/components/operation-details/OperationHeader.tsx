
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Operation } from "@/types/Operation";
import { getStatusLabel, getStatusColor } from "@/utils/operationHelpers";

interface OperationHeaderProps {
  operation: Operation;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const OperationHeader = ({ operation, isAdmin, onEdit, onDelete }: OperationHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Panel
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{operation.company_name}</h1>
          <p className="text-slate-600">{operation.project_name || 'Detalles de la operación'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className={getStatusColor(operation.status)}>
          {getStatusLabel(operation.status)}
        </Badge>
        <FavoriteButton operationId={operation.id} size="default" />
        {isAdmin && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
