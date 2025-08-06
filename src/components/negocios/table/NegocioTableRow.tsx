
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

  const getPriorityText = (prioridad: string) => {
    switch (prioridad) {
      case 'baja': return { text: 'Baja', color: 'text-gray-600' };
      case 'media': return { text: 'Media', color: 'text-yellow-600' };
      case 'alta': return { text: 'Alta', color: 'text-orange-600' };
      case 'urgente': return { text: 'Urgente', color: 'text-red-600' };
      default: return { text: prioridad, color: 'text-gray-600' };
    }
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell className="font-medium">
        <Link 
          to={`/negocios/${negocio.id}`}
          className="text-gray-900 hover:text-gray-600 font-medium"
        >
          {negocio.nombre_negocio}
        </Link>
        {negocio.company && (
          <div className="text-sm text-gray-500 mt-1">{negocio.company.name}</div>
        )}
      </TableCell>
      
      <TableCell>
        <div className="font-medium">
          {formatCurrency(negocio.valor_negocio)}
        </div>
        <div className="text-sm text-gray-500">{negocio.moneda}</div>
      </TableCell>
      
      <TableCell>
        <span className="text-gray-600 capitalize text-sm">
          {negocio.tipo_negocio}
        </span>
      </TableCell>
      
      <TableCell>
        {negocio.stage ? (
          <span className="text-gray-900 font-medium text-sm">
            {negocio.stage.name}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">Sin etapa</span>
        )}
      </TableCell>
      
      <TableCell>
        {(() => {
          const priority = getPriorityText(negocio.prioridad);
          return (
            <span className={`text-sm font-medium ${priority.color}`}>
              {priority.text}
            </span>
          );
        })()}
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
