
import { 
  Table, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Operation } from "@/types/Operation";
import { AdminTableHeader } from "./admin/AdminTableHeader";
import { AdminTableBody } from "./admin/AdminTableBody";
import { OperationDetailsDialog } from "./admin/OperationDetailsDialog";
import { EditOperationDialog } from "./admin/EditOperationDialog";
import { TeaserUploadDialog } from "./admin/TeaserUploadDialog";
import { useAdminTableFilters } from "@/hooks/admin/useAdminTableFilters";
import { useAdminDialogs } from "@/hooks/admin/useAdminDialogs";
import { useAdminOperationHandlers } from "./admin/AdminOperationHandlers";

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
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterSector,
    setFilterSector,
    filteredOperations,
    uniqueSectors
  } = useAdminTableFilters(operations);

  const {
    detailsDialog,
    editDialog,
    uploadDialog,
    openDetailsDialog,
    closeDetailsDialog,
    openEditDialog,
    closeEditDialog,
    openUploadDialog,
    closeUploadDialog
  } = useAdminDialogs();

  const {
    handleDeleteOperation,
    handleDownloadTeaser,
    handleSaveEdit,
    handleUploadComplete
  } = useAdminOperationHandlers({
    onUpdateOperation,
    onDeleteOperation,
    onUpdateTeaserUrl
  });

  const handleSaveEditWrapper = async (operationData: Partial<Operation>) => {
    if (!editDialog.operation) return;
    
    const result = await handleSaveEdit(editDialog.operation.id, operationData);
    if (result.success) {
      closeEditDialog();
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
                <TableHead>Proyecto</TableHead>
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
            <AdminTableBody
              filteredOperations={filteredOperations}
              searchTerm={searchTerm}
              filterStatus={filterStatus}
              filterSector={filterSector}
              onViewDetails={openDetailsDialog}
              onEditOperation={openEditDialog}
              onDeleteOperation={handleDeleteOperation}
              onUploadTeaser={openUploadDialog}
              onDownloadTeaser={handleDownloadTeaser}
            />
          </Table>
        </div>
      </div>

      {/* Dialogs */}
      <OperationDetailsDialog
        open={detailsDialog.open}
        onOpenChange={closeDetailsDialog}
        operation={detailsDialog.operation}
      />

      <EditOperationDialog
        open={editDialog.open}
        onOpenChange={closeEditDialog}
        operation={editDialog.operation}
        onSave={handleSaveEditWrapper}
      />

      <TeaserUploadDialog
        open={uploadDialog.open}
        onOpenChange={closeUploadDialog}
        operation={uploadDialog.operation}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};
