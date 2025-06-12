
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Operation } from "@/types/Operation";
import { AdminTableHeader } from "./admin/AdminTableHeader";
import { OperationTableRow } from "./admin/OperationTableRow";

interface AdminOperationsTableProps {
  operations: Operation[];
  loading: boolean;
  error: string | null;
}

export const AdminOperationsTable = ({ 
  operations, 
  loading, 
  error 
}: AdminOperationsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");

  // Filter operations based on search and filters
  const filteredOperations = operations.filter(operation => {
    const matchesSearch = operation.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operation.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         operation.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || operation.status === filterStatus;
    const matchesSector = filterSector === "all" || operation.sector === filterSector;
    
    return matchesSearch && matchesStatus && matchesSector;
  });

  // Get unique sectors for filter dropdown
  const uniqueSectors = Array.from(new Set(operations.map(op => op.sector)));

  const handleViewDetails = (operation: Operation) => {
    console.log("View details for:", operation.company_name);
  };

  const handleEditOperation = (operation: Operation) => {
    console.log("Edit operation:", operation.company_name);
  };

  const handleDeleteOperation = (operation: Operation) => {
    console.log("Delete operation:", operation.company_name);
  };

  const handleUploadTeaser = (operation: Operation) => {
    console.log("Upload teaser for:", operation.company_name);
  };

  const handleDownloadTeaser = (operation: Operation) => {
    console.log("Download teaser for:", operation.company_name);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gestión de Operaciones</h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gestión de Operaciones</h2>
        </div>
        <div className="flex items-center justify-center h-32 text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AdminTableHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onStatusChange={setFilterStatus}
        filterSector={filterSector}
        onSectorChange={setFilterSector}
        uniqueSectors={uniqueSectors}
        filteredCount={filteredOperations.length}
        totalCount={operations.length}
      />

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Facturación</TableHead>
              <TableHead>EBITDA</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Teaser</TableHead>
              <TableHead>Gestor</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="text-gray-500">
                    {searchTerm || filterStatus !== "all" || filterSector !== "all" 
                      ? "No se encontraron operaciones con los filtros aplicados"
                      : "No hay operaciones disponibles"
                    }
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOperations.map((operation) => (
                <OperationTableRow
                  key={operation.id}
                  operation={operation}
                  onViewDetails={handleViewDetails}
                  onEditOperation={handleEditOperation}
                  onDeleteOperation={handleDeleteOperation}
                  onUploadTeaser={handleUploadTeaser}
                  onDownloadTeaser={handleDownloadTeaser}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
