
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Euro, Building2, User, Calendar } from "lucide-react";
import { Negocio } from "@/types/Negocio";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

interface NegocioTableRowProps {
  negocio: Negocio;
  onEdit: (negocio: Negocio) => void;
  onDelete: (negocioId: string) => void;
}

export const NegocioTableRow = ({ negocio, onEdit, onDelete }: NegocioTableRowProps) => {
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return "bg-gray-100 text-gray-800";
      case 'media': return "bg-yellow-100 text-yellow-800";
      case 'alta': return "bg-orange-100 text-orange-800";
      case 'urgente': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDaysInPipeline = (createdAt: string) => {
    const days = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este negocio?')) {
      onDelete(negocio.id);
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center space-x-2">
          <div>
            <Link 
              to={`/negocios/${negocio.id}`}
              className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              {negocio.nombre_negocio}
            </Link>
            <p className="text-sm text-gray-500 capitalize">{negocio.tipo_negocio}</p>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        {negocio.company ? (
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span>{negocio.company.name}</span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      
      <TableCell>
        {negocio.contact ? (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="font-medium">{negocio.contact.name}</p>
              {negocio.contact.position && (
                <p className="text-sm text-gray-500">{negocio.contact.position}</p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </TableCell>
      
      <TableCell>
        {negocio.stage ? (
          <Badge 
            variant="outline" 
            style={{ 
              backgroundColor: negocio.stage.color + '20', 
              borderColor: negocio.stage.color,
              color: negocio.stage.color 
            }}
          >
            {negocio.stage.name}
          </Badge>
        ) : (
          <span className="text-gray-400">Sin etapa</span>
        )}
      </TableCell>
      
      <TableCell>
        <Badge className={getPriorityColor(negocio.prioridad)} variant="outline">
          {negocio.prioridad}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-1">
          <Euro className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{formatCurrency(negocio.valor_negocio)}</span>
        </div>
      </TableCell>
      
      <TableCell>
        {negocio.propietario_negocio ? (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span>{negocio.propietario_negocio}</span>
          </div>
        ) : (
          <span className="text-gray-400">Sin asignar</span>
        )}
      </TableCell>
      
      <TableCell>
        <span className="text-sm">{negocio.sector || '-'}</span>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{getDaysInPipeline(negocio.created_at)} días</span>
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-gray-500">
          {format(new Date(negocio.created_at), 'dd/MM/yyyy', { locale: es })}
        </span>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(negocio)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
