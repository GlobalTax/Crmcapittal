
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { OperationsList } from "@/components/OperationsList";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { AddOperationDialog } from "@/components/AddOperationDialog";
import { AdminOperationsTable } from "@/components/AdminOperationsTable";
import { useOperationsContext } from "@/contexts";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Building2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PortfolioViewProps {
  showHeader?: boolean;
  showAddCompany?: boolean;
}

export const PortfolioView = React.memo(({ showHeader = true, showAddCompany = true }: PortfolioViewProps) => {
  // Get operations from context
  const { operations, loading, createOperation } = useOperationsContext();
  const { role } = useUserRole();
  const [showAddOperationDialog, setShowAddOperationDialog] = useState(false);
  const { toast } = useToast();

  const isAdmin = role === 'admin' || role === 'superadmin';

  // Memoized stats calculations
  const stats = useMemo(() => {
    const totalValue = operations.reduce((sum, op) => sum + op.amount, 0);
    const availableOperations = operations.filter(op => op.status === "available").length;
    const totalOperations = operations.length;
    
    return { totalValue, availableOperations, totalOperations };
  }, [operations]);

  const handleAddOperation = useCallback(async (operationData: any) => {
    try {
      await createOperation(operationData);
      toast({
        title: "Éxito",
        description: "Operación creada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la operación",
        variant: "destructive",
      });
    }
  }, [createOperation, toast]);

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
              {isAdmin ? "Gestión de Portfolio" : "Oportunidades de Inversión"}
            </h2>
            <p className="text-base sm:text-lg text-gray-700">
              {isAdmin ? "Administra y gestiona las operaciones del portfolio" : "Descubre las mejores operaciones disponibles para inversión"}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {isAdmin ? "Controla el estado y la información de todas las operaciones" : "Contacta directamente para más información detallada"}
            </p>
          </div>
          
          <div className="flex justify-center lg:justify-end space-x-3">
            <Button
              onClick={() => setShowAddOperationDialog(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nueva Operación</span>
            </Button>
            
            {showAddCompany && <AddCompanyDialog />}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-lg" style={{ border: '0.5px solid black' }}>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Valor Total</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                €{(stats.totalValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-600">Portfolio completo</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-lg" style={{ border: '0.5px solid black' }}>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Disponibles</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black mb-1">{stats.availableOperations}</p>
              <p className="text-xs text-gray-600">Listas para inversión</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-lg sm:col-span-2 lg:col-span-1" style={{ border: '0.5px solid black' }}>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Total Operaciones</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black mb-1">{stats.totalOperations}</p>
              <p className="text-xs text-gray-600">En el portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on user role */}
      {isAdmin ? (
        <Tabs defaultValue="operations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Gestión Operaciones
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Vista Portfolio
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="operations" className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Administración de Operaciones</h3>
                <AdminOperationsTable />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="portfolio">
            <OperationsList />
          </TabsContent>
        </Tabs>
      ) : (
        <OperationsList />
      )}

      {/* Add Operation Dialog */}
      <AddOperationDialog
        open={showAddOperationDialog}
        onOpenChange={setShowAddOperationDialog}
        onAddOperation={handleAddOperation}
      />
    </div>
  );
});
