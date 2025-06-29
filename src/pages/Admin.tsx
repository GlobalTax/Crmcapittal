
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PendingOperationsManager } from "@/components/PendingOperationsManager";
import { AdminOperationsTable } from "@/components/AdminOperationsTable";
import { useOperations } from "@/hooks/useOperations";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Admin = () => {
  const { 
    operations, 
    loading, 
    error,
    updateOperation,
    updateOperationStatus,
    deleteOperation,
    updateTeaserUrl
  } = useOperations();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Administración</h2>
            <p className="text-muted-foreground">
              Gestiona las operaciones del sistema y revisa solicitudes pendientes.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Operación
          </Button>
        </div>

        <div className="space-y-6">
          <PendingOperationsManager 
            operations={operations} 
            onStatusUpdate={updateOperationStatus}
          />
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Todas las Operaciones</h3>
              <AdminOperationsTable 
                operations={operations}
                loading={loading}
                error={error}
                onUpdateOperation={updateOperation}
                onDeleteOperation={deleteOperation}
                onUpdateTeaserUrl={updateTeaserUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
