import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">Cartera de Operaciones M&A</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-black">Operaciones disponibles para inversión</p>
                <p className="text-xs text-black">Contacta para más información</p>
              </div>
              <Link to="/auth">
                <Button variant="outline" size="sm">
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
          <div className="bg-white p-6 rounded-xl shadow-sm border-black hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Valor Total</p>
                <p className="text-2xl font-bold text-black">
                  €{(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-black hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Disponibles</p>
                <p className="text-2xl font-bold text-black">{availableOperations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-black hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Total Operaciones</p>
                <p className="text-2xl font-bold text-black">{totalOperations}</p>
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
