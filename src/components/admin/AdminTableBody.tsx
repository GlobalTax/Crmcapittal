
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Operation } from "@/types/Operation";
import { OperationTableRow } from "./OperationTableRow";

interface AdminTableBodyProps {
  filteredOperations: Operation[];
  searchTerm: string;
  filterStatus: string;
  filterSector: string;
  onViewDetails: (operation: Operation) => void;
  onEditOperation: (operation: Operation) => void;
  onDeleteOperation: (operation: Operation) => void;
  onUploadTeaser: (operation: Operation) => void;
  onDownloadTeaser: (operation: Operation) => void;
}

export const AdminTableBody = ({
  filteredOperations,
  searchTerm,
  filterStatus,
  filterSector,
  onViewDetails,
  onEditOperation,
  onDeleteOperation,
  onUploadTeaser,
  onDownloadTeaser
}: AdminTableBodyProps) => {
  if (filteredOperations.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={11} className="text-center py-8">
            <div className="text-gray-500">
              {searchTerm || filterStatus !== "all" || filterSector !== "all" 
                ? "No se encontraron operaciones con los filtros aplicados"
                : "No hay operaciones disponibles"
              }
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {filteredOperations.map((operation) => (
        <OperationTableRow
          key={operation.id}
          operation={operation}
          onViewDetails={onViewDetails}
          onEditOperation={onEditOperation}
          onDeleteOperation={onDeleteOperation}
          onUploadTeaser={onUploadTeaser}
          onDownloadTeaser={onDownloadTeaser}
        />
      ))}
    </TableBody>
  );
};
