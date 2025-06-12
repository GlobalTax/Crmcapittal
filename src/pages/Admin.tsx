
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, LogOut } from "lucide-react";
import { AddOperationDialog } from "@/components/AddOperationDialog";
import { useOperations } from "@/hooks/useOperations";
import { Operation } from "@/types/Operation";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { operations, loading, error, addOperation } = useOperations();
  const { signOut, user } = useAuth();
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al Portfolio
                </Button>
              </Link>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-black">Panel de Administración</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-black">Bienvenido, {user?.email}</p>
              </div>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Operación
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{operations.length}</p>
              <p className="text-sm text-black">Operaciones Disponibles</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">
                €{(operations.reduce((sum, op) => sum + op.amount, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-black">Valor Total Portfolio</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">
                {Array.from(new Set(operations.map(op => op.sector))).length}
              </p>
              <p className="text-sm text-black">Sectores Representados</p>
            </div>
          </div>
        </div>

        {/* Operations Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-black">Gestión de Operaciones</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-black">Cargando operaciones...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : operations.length === 0 ? (
            <div className="p-12 text-center">
              <h3 className="text-lg font-medium text-black mb-2">No hay operaciones</h3>
              <p className="text-black mb-4">Añade tu primera operación al portfolio</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Primera Operación
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Sector
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {operations.map((operation) => (
                    <tr key={operation.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-black">
                            {operation.company_name}
                          </div>
                          <div className="text-sm text-black">
                            {operation.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {operation.sector}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {operation.operation_type === 'acquisition' && 'Adquisición'}
                        {operation.operation_type === 'merger' && 'Fusión'}
                        {operation.operation_type === 'sale' && 'Venta'}
                        {operation.operation_type === 'ipo' && 'OPV'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {operation.currency} {(operation.amount / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Disponible
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                        {new Date(operation.date).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
