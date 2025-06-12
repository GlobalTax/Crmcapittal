import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OperationsList } from "@/components/OperationsList";
import { OperationFilters } from "@/components/OperationFilters";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { useOperations } from "@/hooks/useOperations";
import { Operation } from "@/types/Operation";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { operations, loading, error } = useOperations();
  const { user } = useAuth();
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white" style={{ borderBottom: '0.5px solid black' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Primera fila: Navegación y usuario */}
          <div className="flex items-center justify-between py-4" style={{ borderBottom: '0.5px solid #d1d5db' }}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-xl font-bold text-black">Relación de Open Deals</h1>
                  <p className="text-sm text-gray-600">Portal de inversiones y oportunidades</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" size="default" className="text-base px-6 py-3 h-auto border-black text-black hover:bg-gray-100">
                    Mi Panel
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="default" className="text-base px-6 py-3 h-auto border-black text-black hover:bg-gray-100">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
              <Link to="/auth">
                <Button variant="outline" size="default" className="text-base px-6 py-3 h-auto border-black text-black hover:bg-gray-100">
                  Panel Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Segunda fila: Descripción y acción principal */}
          <div className="flex items-center justify-between py-6">
            <div>
              <h2 className="text-3xl font-bold text-black mb-2">Oportunidades de Inversión</h2>
              <p className="text-lg text-gray-700">Descubre las mejores operaciones disponibles para inversión</p>
              <p className="text-sm text-gray-600 mt-1">Contacta directamente para más información detallada</p>
            </div>
            
            <AddCompanyDialog />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 bg-white">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-8 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <p className="text-base font-semibold text-black">Valor Total</p>
                </div>
                <p className="text-3xl font-bold text-black mb-1">
                  €{(totalValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-600">Portfolio completo</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <p className="text-base font-semibold text-black">Disponibles</p>
                </div>
                <p className="text-3xl font-bold text-black mb-1">{availableOperations}</p>
                <p className="text-sm text-gray-600">Listas para inversión</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <p className="text-base font-semibold text-black">Total Operaciones</p>
                </div>
                <p className="text-3xl font-bold text-black mb-1">{totalOperations}</p>
                <p className="text-sm text-gray-600">En el portfolio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        {!loading && (
          <div className="mb-8">
            <OperationFilters 
              operations={operations} 
              onFilter={handleFilter}
            />
          </div>
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
