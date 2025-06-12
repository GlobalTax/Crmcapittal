
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black text-sm">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (role !== 'superadmin' && role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Acceso Denegado</h1>
          <p className="text-black mb-6 text-base">No tienes permisos de administrador</p>
          <Link to="/">
            <Button size="lg">Volver al Portfolio</Button>
          </Link>
        </div>
      </div>
    );
  }

  const availableOperations = operations.filter(op => op.status === 'available');
  const pendingOperations = operations.filter(op => op.status === 'pending_review');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Primera fila: Navegación y usuario */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="default" className="text-sm font-medium">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Portfolio
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
              
              {role === 'superadmin' && (
                <Link to="/superadmin">
                  <Button variant="outline" size="default" className="text-sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Panel Superadmin
                  </Button>
                </Link>
              )}
              
              <Button variant="outline" onClick={handleSignOut} size="default" className="text-sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Segunda fila: Título y acciones principales */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600 mt-1">Gestiona las operaciones y solicitudes del sistema</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                role === 'superadmin' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {role?.toUpperCase()}
              </span>
            </div>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-base px-6 py-3 h-auto"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Añadir Operación
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 mb-2">{availableOperations.length}</p>
              <p className="text-sm font-medium text-gray-600">Operaciones Disponibles</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 mb-2">{pendingOperations.length}</p>
              <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 mb-2">
                €{(availableOperations.reduce((sum, op) => sum + op.amount, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm font-medium text-gray-600">Valor Total Portfolio</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {Array.from(new Set(operations.map(op => op.sector))).length}
              </p>
              <p className="text-sm font-medium text-gray-600">Sectores Representados</p>
            </div>
          </div>
        </div>

        {/* Pending Operations Manager */}
        {pendingOperations.length > 0 && (
          <div className="mb-8">
            <PendingOperationsManager 
              operations={operations}
              onStatusUpdate={updateOperationStatus}
            />
          </div>
        )}

        {/* Operations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
