import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, FileText, Calendar, Target, Euro } from 'lucide-react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandatesTableProps {
  data: BuyingMandate[];
}

export const MandatesTable: React.FC<MandatesTableProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'completed':
        return 'bg-blue-50 text-blue-700';
      case 'paused':
        return 'bg-amber-50 text-amber-700';
      case 'cancelled':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'paused':
        return 'Pausado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'bg-purple-50 text-purple-700';
      case 'sell':
        return 'bg-emerald-50 text-emerald-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'buy':
        return 'Compra';
      case 'sell':
        return 'Venta';
      default:
        return type;
    }
  };

  const formatBudget = (budget: number | null) => {
    if (!budget) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(budget);
  };

  if (data.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">No hay mandatos disponibles</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mandato</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Presupuesto</TableHead>
            <TableHead>Creado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((mandate) => (
            <TableRow key={mandate.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-50 rounded-lg">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {mandate.mandate_name}
                    </span>
                    {mandate.client_name && (
                      <span className="text-sm text-gray-600">
                        Cliente: {mandate.client_name}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getTypeColor(mandate.mandate_type)}
                >
                  {getTypeLabel(mandate.mandate_type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant="secondary" 
                  className={getStatusColor(mandate.status)}
                >
                  {getStatusLabel(mandate.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-gray-600 text-sm">
                  {mandate.target_sectors?.join(', ') || '-'}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-gray-600">
                  <Euro className="h-3 w-3" />
                  <span className="text-sm">
                    {formatBudget(mandate.min_revenue)} - {formatBudget(mandate.max_revenue)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(mandate.created_at), 'dd MMM', { locale: es })}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};