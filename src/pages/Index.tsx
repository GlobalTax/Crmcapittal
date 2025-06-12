
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Building2, DollarSign, Settings } from "lucide-react";
import { OperationsList } from "@/components/OperationsList";
import { OperationFilters } from "@/components/OperationFilters";
import { useOperations } from "@/hooks/useOperations";
import { Operation } from "@/types/Operation";
import { Link } from "react-router-dom";

const Index = () => {
  const { operations, loading, error } = useOperations();
  const [filteredOperations, setFilteredOperations] = useState<Operation[]>([]);

  const handleFilter = (filtered: Operation[]) => {
    setFilteredOperations(filtered);
  };

  // Use filtered operations if filters are applied, otherwise use all operations
  const displayOperations = filteredOperations.length > 0 || operations.length === 0 ? filteredOperations : operations;

  const totalValue = displayOperations.reduce((sum, op) => sum + op.amount, 0);
  const availableOperations = displayOperations.filter(op => op.status === "available").length;
  const totalOperations = displayOperations.length;

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
              <h1 className="text-2xl font-bold text-slate-900">Cartera de Operaciones M&A</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-600">Operaciones disponibles para inversión</p>
                <p className="text-xs text-slate-500">Contacta para más información</p>
              </div>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Panel Admin
                </Button>
              </Link>
            </div>
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
                <p className="text-sm font-medium text-slate-600">Disponibles</p>
                <p className="text-2xl font-bold text-slate-900">{availableOperations}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Operaciones</p>
                <p className="text-2xl font-bold text-slate-900">{totalOperations}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Building2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {!loading && (
          <OperationFilters 
            operations={operations} 
            onFilter={handleFilter}
          />
        )}

        {/* Operations List */}
        <OperationsList 
          operations={displayOperations} 
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default Index;
