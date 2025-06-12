
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, LogOut } from "lucide-react";
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
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
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">Volver al Portfolio</Button>
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
      <header className="bg-white" style={{ borderBottom: '0.5px solid black' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Primera fila: Navegación y usuario */}
          <div className="flex items-center justify-between py-4" style={{ borderBottom: '0.5px solid #d1d5db' }}>
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="default" className="text-sm font-medium border-black text-black hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Portfolio
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-black">{user?.email}</p>
                <p className="text-xs text-gray-600">Administrador</p>
              </div>
              
              {role === 'superadmin' && (
                <Link to="/superadmin">
                  <Button variant="outline" size="default" className="text-sm border-black text-black hover:bg-gray-100">
                    Panel Superadmin
                  </Button>
                </Link>
              )}
              
              <Button variant="outline" onClick={handleSignOut} size="default" className="text-sm border-black text-black hover:bg-gray-100">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Segunda fila: Título y acciones principales */}
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-black">Panel de Administración</h1>
                <p className="text-sm text-gray-600 mt-1">Gestiona las operaciones y solicitudes del sistema</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-[10px] ${
                role === 'superadmin' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-200 text-black'
              }`} style={{ border: '0.5px solid black' }}>
                {role?.toUpperCase()}
              </span>
            </div>
            
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-black hover:bg-gray-800 text-white text-base px-6 py-3 h-auto"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Añadir Operación
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 bg-white">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-2">{availableOperations.length}</p>
              <p className="text-sm font-medium text-gray-700">Operaciones Disponibles</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-2">{pendingOperations.length}</p>
              <p className="text-sm font-medium text-gray-700">Solicitudes Pendientes</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-2">
                €{(availableOperations.reduce((sum, op) => sum + op.amount, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm font-medium text-gray-700">Valor Total Portfolio</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-black mb-2">
                {Array.from(new Set(operations.map(op => op.sector))).length}
              </p>
              <p className="text-sm font-medium text-gray-700">Sectores Representados</p>
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
        <div className="bg-white rounded-[10px] p-6" style={{ border: '0.5px solid black' }}>
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
