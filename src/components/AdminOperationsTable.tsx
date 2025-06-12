
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
import { OperationDetailsDialog } from "./admin/OperationDetailsDialog";
import { EditOperationDialog } from "./admin/EditOperationDialog";
import { TeaserUploadDialog } from "./admin/TeaserUploadDialog";
import { useToast } from "@/hooks/use-toast";

interface AdminOperationsTableProps {
  operations: Operation[];
  loading: boolean;
  error: string | null;
  onUpdateOperation: (operationId: string, operationData: Partial<Operation>) => Promise<{ data: any; error: string | null }>;
  onDeleteOperation: (operationId: string) => Promise<{ error: string | null }>;
  onUpdateTeaserUrl: (operationId: string, teaserUrl: string) => Promise<{ data: any; error: string | null }>;
}

export const AdminOperationsTable = ({ 
  operations, 
  loading, 
  error,
  onUpdateOperation,
  onDeleteOperation,
  onUpdateTeaserUrl
}: AdminOperationsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSector, setFilterSector] = useState<string>("all");
  
  // Dialog states
  const [detailsDialog, setDetailsDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });
  
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });
  
  const [uploadDialog, setUploadDialog] = useState<{
    open: boolean;
    operation: Operation | null;
  }>({ open: false, operation: null });

  const { toast } = useToast();

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
    setDetailsDialog({ open: true, operation });
  };

  const handleEditOperation = (operation: Operation) => {
    setEditDialog({ open: true, operation });
  };

  const handleDeleteOperation = async (operation: Operation) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la operación "${operation.company_name}"?`)) {
      const { error } = await onDeleteOperation(operation.id);
      
      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Operación eliminada",
          description: "La operación se ha eliminado correctamente",
        });
      }
    }
  };

  const handleUploadTeaser = (operation: Operation) => {
    setUploadDialog({ open: true, operation });
  };

  const handleDownloadTeaser = (operation: Operation) => {
    if (operation.teaser_url) {
      // TODO: Implement actual download functionality
      window.open(operation.teaser_url, '_blank');
    }
  };

  const handleSaveEdit = async (operationData: Partial<Operation>) => {
    if (!editDialog.operation) return;
    
    const { error } = await onUpdateOperation(editDialog.operation.id, operationData);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Operación actualizada",
        description: "Los cambios se han guardado correctamente",
      });
    }
  };

  const handleUploadComplete = async (operationId: string, teaserUrl: string) => {
    const { error } = await onUpdateTeaserUrl(operationId, teaserUrl);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Teaser actualizado",
        description: "El teaser se ha subido correctamente",
      });
    }
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
    <>
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

      {/* Dialogs */}
      <OperationDetailsDialog
        open={detailsDialog.open}
        onOpenChange={(open) => setDetailsDialog({ open, operation: null })}
        operation={detailsDialog.operation}
      />

      <EditOperationDialog
        open={editDialog.open}
        onOpenChange={(open) => setEditDialog({ open, operation: null })}
        operation={editDialog.operation}
        onSave={handleSaveEdit}
      />

      <TeaserUploadDialog
        open={uploadDialog.open}
        onOpenChange={(open) => setUploadDialog({ open, operation: null })}
        operation={uploadDialog.operation}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};
