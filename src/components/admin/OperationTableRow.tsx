
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Operation } from "@/types/Operation";
import { getStatusLabel, getOperationTypeLabel } from "@/utils/operationHelpers";
import { OperationTeaserCell } from "./OperationTeaserCell";
import { OperationActionsMenu } from "./OperationActionsMenu";

interface OperationTableRowProps {
  operation: Operation;
  onViewDetails: (operation: Operation) => void;
  onEditOperation: (operation: Operation) => void;
  onDeleteOperation: (operation: Operation) => void;
  onUploadTeaser: (operation: Operation) => void;
  onDownloadTeaser: (operation: Operation) => void;
}

export const OperationTableRow = ({
  operation,
  onViewDetails,
  onEditOperation,
  onDeleteOperation,
  onUploadTeaser,
  onDownloadTeaser
}: OperationTableRowProps) => {
  const getStatusBadgeVariant = (status: Operation['status']) => {
    switch (status) {
      case 'available': return 'default';
      case 'pending_review': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'in_process': return 'secondary';
      case 'sold': return 'outline';
      case 'withdrawn': return 'destructive';
      default: return 'outline';
    }
  };

  const handleViewDetails = () => {
    // Navegar directamente a la página de detalles en lugar de usar el diálogo
    window.location.href = `/operation/${operation.id}`;
  };

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="font-medium text-sm">{operation.company_name}</div>
          <div className="text-xs text-gray-500">{operation.location}</div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">
          {operation.project_name ? (
            <span className="font-medium">{operation.project_name}</span>
          ) : (
            <span className="text-gray-400 text-xs">Sin nombre</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <span className="text-sm">{operation.sector}</span>
      </TableCell>
      
      <TableCell>
        <span className="text-sm">
          {getOperationTypeLabel(operation.operation_type)}
        </span>
      </TableCell>
      
      <TableCell>
        <div className="text-sm">
          {operation.revenue ? (
            <div className="font-medium">
              €{(operation.revenue / 1000000).toFixed(1)}M
            </div>
          ) : (
            <span className="text-gray-400 text-xs">No disponible</span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <div className="text-sm">
          {operation.ebitda ? (
            <div className="font-medium">
              €{(operation.ebitda / 1000000).toFixed(1)}M
            </div>
          ) : (
            <span className="text-gray-400 text-xs">No disponible</span>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant={getStatusBadgeVariant(operation.status)} className="text-xs">
          {getStatusLabel(operation.status)}
        </Badge>
      </TableCell>
      
      <TableCell>
        <OperationTeaserCell
          operation={operation}
          onUpload={onUploadTeaser}
          onDownload={onDownloadTeaser}
        />
      </TableCell>
      
      <TableCell>
        {operation.manager ? (
          <div>
            <div className="text-sm font-medium">{operation.manager.name}</div>
            <div className="text-xs text-gray-500">{operation.manager.position}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Sin asignar</span>
        )}
      </TableCell>
      
      <TableCell>
        <span className="text-sm">
          {new Date(operation.date).toLocaleDateString('es-ES')}
        </span>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleViewDetails}>
            <Eye className="h-4 w-4" />
          </Button>
          <OperationActionsMenu
            operation={operation}
            onView={onViewDetails}
            onEdit={onEditOperation}
            onDelete={onDeleteOperation}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
