import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Operation } from '@/types/Operation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Building2,
  MapPin,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OperationsTableOptimizedProps {
  operations: Operation[];
  onViewOperation: (operationId: string) => void;
  onEditOperation: (operationId: string) => void;
  onDeleteOperation: (operationId: string) => void;
  isLoading?: boolean;
  height?: number;
}

interface RowData {
  operations: Operation[];
  onViewOperation: (operationId: string) => void;
  onEditOperation: (operationId: string) => void;
  onDeleteOperation: (operationId: string) => void;
}

const TableRow = React.memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties; 
  data: RowData;
}) => {
  const { operations, onViewOperation, onEditOperation, onDeleteOperation } = data;
  const operation = operations[index];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in_negotiation': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={style} className="flex items-center border-b hover:bg-muted/50 px-4">
      <div className="grid grid-cols-12 gap-4 w-full items-center">
        {/* Company & Sector */}
        <div className="col-span-3">
          <div className="font-medium truncate flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {operation.company_name}
          </div>
          <div className="text-sm text-muted-foreground truncate">
            {operation.sector}
          </div>
        </div>

        {/* Location */}
        <div className="col-span-2 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="truncate text-sm">{operation.location}</span>
        </div>

        {/* Type */}
        <div className="col-span-1">
          <Badge variant="outline" className="text-xs">
            {operation.operation_type}
          </Badge>
        </div>

        {/* Amount */}
        <div className="col-span-2 flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium text-sm">
            {formatCurrency(operation.amount)}
          </span>
        </div>

        {/* Status */}
        <div className="col-span-1">
          <Badge 
            variant="outline" 
            className={`text-xs ${getStatusColor(operation.status)}`}
          >
            {operation.status}
          </Badge>
        </div>

        {/* Revenue */}
        <div className="col-span-1 text-sm">
          {operation.revenue ? formatCurrency(operation.revenue) : '-'}
        </div>

        {/* Growth Rate */}
        <div className="col-span-1 text-sm">
          {operation.annual_growth_rate ? `${operation.annual_growth_rate}%` : '-'}
        </div>

        {/* Date */}
        <div className="col-span-1 text-sm text-muted-foreground">
          {format(new Date(operation.created_at), 'dd/MM', { locale: es })}
        </div>

        {/* Actions */}
        <div className="col-span-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewOperation(operation.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditOperation(operation.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteOperation(operation.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
});

TableRow.displayName = 'OperationTableRow';

export const OperationsTableOptimized = React.memo(({
  operations,
  onViewOperation,
  onEditOperation,
  onDeleteOperation,
  isLoading,
  height = 600
}: OperationsTableOptimizedProps) => {
  const rowData = useMemo(() => ({
    operations,
    onViewOperation,
    onEditOperation,
    onDeleteOperation
  }), [operations, onViewOperation, onEditOperation, onDeleteOperation]);

  if (operations.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay operaciones disponibles</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 font-medium text-sm">
          <div className="col-span-3">Empresa/Sector</div>
          <div className="col-span-2">Ubicación</div>
          <div className="col-span-1">Tipo</div>
          <div className="col-span-2">Importe</div>
          <div className="col-span-1">Estado</div>
          <div className="col-span-1">Facturación</div>
          <div className="col-span-1">Crecimiento</div>
          <div className="col-span-1">Fecha</div>
          <div className="col-span-1"></div>
        </div>
      </div>

      {/* Virtualized Body */}
      <List
        height={height}
        width="100%"
        itemCount={operations.length}
        itemSize={80}
        itemData={rowData}
        overscanCount={5}
      >
        {TableRow}
      </List>
    </div>
  );
});

OperationsTableOptimized.displayName = 'OperationsTableOptimized';