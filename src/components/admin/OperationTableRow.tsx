
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="font-medium text-sm">{operation.company_name}</div>
          <div className="text-xs text-gray-500">{operation.location}</div>
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
        <div className="text-sm font-medium">
          {operation.currency} {(operation.amount / 1000000).toFixed(1)}M
        </div>
        {operation.revenue && (
          <div className="text-xs text-gray-500">
            Rev: €{(operation.revenue / 1000000).toFixed(1)}M
          </div>
        )}
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
        <OperationActionsMenu
          operation={operation}
          onView={onViewDetails}
          onEdit={onEditOperation}
          onDelete={onDeleteOperation}
        />
      </TableCell>
    </TableRow>
  );
};
