
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Negocio } from "@/types/Negocio";

interface NegocioHeaderProps {
  negocio: Negocio;
  onEdit: () => void;
}

export const NegocioHeader = ({ negocio, onEdit }: NegocioHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Link to="/negocios">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{negocio.nombre_negocio}</h1>
          <p className="text-gray-600 capitalize">{negocio.tipo_negocio}</p>
        </div>
      </div>
      <Button onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Editar Negocio
      </Button>
    </div>
  );
};
