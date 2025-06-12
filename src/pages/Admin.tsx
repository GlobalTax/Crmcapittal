
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, LogOut, Crown } from "lucide-react";
import { AddOperationDialog } from "@/components/AddOperationDialog";
import { PendingOperationsManager } from "@/components/PendingOperationsManager";
import { AdminOperationsTable } from "@/components/AdminOperationsTable";
import { useOperations } from "@/hooks/useOperations";
import { Operation } from "@/types/Operation";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Admin = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { operations, loading, error, addOperation, updateOperationStatus } = useOperations();
  const { signOut, user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const handleAddOperation = async (operationData: Omit<Operation, "id" | "created_at" | "updated_at">) => {
    const { error } = await addOperation(operationData);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Éxito",
        description: "Operación añadida correctamente",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-black text-xs">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (role !== 'superadmin' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-bold text-black mb-2">Acceso Denegado</h1>
          <p className="text-black mb-2 text-sm">No tienes permisos de administrador</p>
          <Link to="/">
            <Button size="sm">Volver al Portfolio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availableOperations = operations.filter(op => op.status === 'available');
  const pendingOperations = operations.filter(op => op.status === 'pending_review');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-black shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Volver al Portfolio
                </Button>
              </Link>
              <div className="flex items-center">
                <h1 className="text-lg font-bold text-black">Panel de Administración</h1>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  role === 'superadmin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {role?.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-xs text-black">Bienvenido, {user?.email}</p>
              </div>
              {role === 'superadmin' && (
                <Link to="/superadmin">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Crown className="h-3 w-3 mr-1" />
                    Panel Superadmin
                  </Button>
                </Link>
              )}
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-xs"
                size="sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Añadir Operación
              </Button>
              <Button variant="outline" onClick={handleSignOut} size="sm" className="text-xs">
                <LogOut className="h-3 w-3 mr-1" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
            <div className="text-center">
              <p className="text-lg font-bold text-black">{availableOperations.length}</p>
              <p className="text-xs text-black">Operaciones Disponibles</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
            <div className="text-center">
              <p className="text-lg font-bold text-black">{pendingOperations.length}</p>
              <p className="text-xs text-black">Solicitudes Pendientes</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
            <div className="text-center">
              <p className="text-lg font-bold text-black">
                €{(availableOperations.reduce((sum, op) => sum + op.amount, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-black">Valor Total Portfolio</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-black">
            <div className="text-center">
              <p className="text-lg font-bold text-black">
                {Array.from(new Set(operations.map(op => op.sector))).length}
              </p>
              <p className="text-xs text-black">Sectores Representados</p>
            </div>
          </div>
        </div>

        {/* Pending Operations Manager */}
        {pendingOperations.length > 0 && (
          <div className="mb-6">
            <PendingOperationsManager 
              operations={operations}
              onStatusUpdate={updateOperationStatus}
            />
          </div>
        )}

        {/* Operations Table - Using new improved component */}
        <div className="bg-white rounded-xl shadow-sm border border-black p-6">
          <AdminOperationsTable 
            operations={operations}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      <AddOperationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddOperation={handleAddOperation}
      />
    </div>
  );
};

export default Admin;
