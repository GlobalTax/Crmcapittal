
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OperationsList } from "@/components/OperationsList";
import { OperationFilters } from "@/components/OperationFilters";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { useOperations } from "@/hooks/useOperations";
import { Operation } from "@/types/Operation";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { User, Settings, TrendingUp, Building2, DollarSign } from "lucide-react";

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
    <div className="min-h-screen bg-gray-50">
      {/* Header mejorado */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Primera fila: Navegación y usuario */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Relación de Open Deals</h1>
                  <p className="text-sm text-gray-600">Portal de inversiones y oportunidades</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" size="default" className="text-base px-6 py-3 h-auto">
                    <User className="h-5 w-5 mr-2" />
                    Mi Panel
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="default" className="text-base px-6 py-3 h-auto">
                    <User className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
              <Link to="/auth">
                <Button variant="outline" size="default" className="text-base px-6 py-3 h-auto">
                  <Settings className="h-5 w-5 mr-2" />
                  Panel Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Segunda fila: Descripción y acción principal */}
          <div className="flex items-center justify-between py-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Oportunidades de Inversión</h2>
              <p className="text-lg text-gray-600">Descubre las mejores operaciones disponibles para inversión</p>
              <p className="text-sm text-gray-500 mt-1">Contacta directamente para más información detallada</p>
            </div>
            
            <AddCompanyDialog />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Cards mejoradas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">Valor Total</p>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  €{(totalValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-sm text-gray-500">Portfolio completo</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">Disponibles</p>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">{availableOperations}</p>
                <p className="text-sm text-gray-500">Listas para inversión</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">Total Operaciones</p>
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">{totalOperations}</p>
                <p className="text-sm text-gray-500">En el portfolio</p>
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
