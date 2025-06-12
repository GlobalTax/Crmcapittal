
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Building2, DollarSign } from "lucide-react";
import { OperationsList } from "@/components/OperationsList";
import { AddOperationDialog } from "@/components/AddOperationDialog";
import { OperationFilters } from "@/components/OperationFilters";

export interface Operation {
  id: string;
  companyName: string;
  sector: string;
  operationType: "acquisition" | "merger" | "sale" | "ipo";
  amount: number;
  currency: string;
  date: string;
  buyer?: string;
  seller?: string;
  status: "completed" | "pending" | "cancelled";
  description: string;
  location: string;
}

const Index = () => {
  const [operations, setOperations] = useState<Operation[]>([
    {
      id: "1",
      companyName: "TechFlow Solutions",
      sector: "Tecnología",
      operationType: "acquisition",
      amount: 50000000,
      currency: "USD",
      date: "2024-03-15",
      buyer: "Global Tech Corp",
      seller: "TechFlow Holdings",
      status: "completed",
      description: "Adquisición estratégica de empresa de software de gestión empresarial",
      location: "Madrid, España"
    },
    {
      id: "2", 
      companyName: "Green Energy Partners",
      sector: "Energía Renovable",
      operationType: "merger",
      amount: 125000000,
      currency: "EUR",
      date: "2024-02-28",
      buyer: "EcoFuture Industries",
      seller: "Green Partners Ltd",
      status: "pending",
      description: "Fusión para crear líder europeo en energía solar",
      location: "Barcelona, España"
    },
    {
      id: "3",
      companyName: "HealthTech Innovations",
      sector: "Salud",
      operationType: "sale",
      amount: 75000000,
      currency: "USD",
      date: "2024-04-02",
      buyer: "MedGlobal Corporation",
      seller: "HealthTech Founders",
      status: "completed",
      description: "Venta de startup de telemedicina a corporación sanitaria global",
      location: "Valencia, España"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>(operations);

  const addOperation = (operation: Omit<Operation, "id">) => {
    const newOperation = {
      ...operation,
      id: Date.now().toString()
    };
    const updatedOperations = [...operations, newOperation];
    setOperations(updatedOperations);
    setFilteredOperations(updatedOperations);
  };

  const handleFilter = (filtered: Operation[]) => {
    setFilteredOperations(filtered);
  };

  const totalValue = filteredOperations.reduce((sum, op) => sum + op.amount, 0);
  const completedOperations = filteredOperations.filter(op => op.status === "completed").length;
  const pendingOperations = filteredOperations.filter(op => op.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">M&A Operations</h1>
            </div>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Operación
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900">
                  €{(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completadas</p>
                <p className="text-2xl font-bold text-slate-900">{completedOperations}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pendientes</p>
                <p className="text-2xl font-bold text-slate-900">{pendingOperations}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <OperationFilters 
          operations={operations} 
          onFilter={handleFilter}
        />

        {/* Operations List */}
        <OperationsList operations={filteredOperations} />

        {/* Add Operation Dialog */}
        <AddOperationDialog 
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onAddOperation={addOperation}
        />
      </div>
    </div>
  );
};

export default Index;
