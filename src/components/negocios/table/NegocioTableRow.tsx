
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Edit, Trash2, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Negocio } from '@/types/Negocio';
import { Link } from 'react-router-dom';

interface NegocioTableRowProps {
  negocio: Negocio;
  onEdit: (negocio: Negocio) => void;
  onDelete: (id: string) => Promise<any>;
}

export const NegocioTableRow = ({ negocio, onEdit, onDelete }: NegocioTableRowProps) => {
  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return "bg-gray-100 text-gray-800";
      case 'media': return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 'alta': return "bg-orange-100 text-orange-800 border-orange-200";
      case 'urgente': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Link 
            to={`/negocios/${negocio.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
          >
            {negocio.nombre_negocio}
          </Link>
          <Link to={`/negocios/${negocio.id}`}>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        {negocio.company && (
          <div className="text-sm text-gray-500">{negocio.company.name}</div>
        )}
      </TableCell>
      
      <TableCell>
        <div className="font-medium">
          {formatCurrency(negocio.valor_negocio)}
        </div>
        <div className="text-sm text-gray-500">{negocio.moneda}</div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {negocio.tipo_negocio}
        </Badge>
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
        <Badge variant="outline" className={getPriorityColor(negocio.prioridad)}>
          {negocio.prioridad}
        </Badge>
      </TableCell>
      
      <TableCell>
        {negocio.contact ? (
          <div>
            <div className="font-medium">{negocio.contact.name}</div>
            {negocio.contact.email && (
              <div className="text-sm text-gray-500">{negocio.contact.email}</div>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Sin contacto</span>
        )}
      </TableCell>
      
      <TableCell>
        <div className="text-sm">{formatDate(negocio.created_at)}</div>
      </TableCell>
      
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/negocios/${negocio.id}`} className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Panel de Trabajo
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(negocio)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(negocio.id)}
              className="text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
