
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OperationsList } from "@/components/OperationsList";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { useOperations } from "@/hooks/useOperations";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { operations, loading, error } = useOperations();
  const { user } = useAuth();

  // Calculate stats from all operations
  const totalValue = operations.reduce((sum, op) => sum + op.amount, 0);
  const availableOperations = operations.filter(op => op.status === "available").length;
  const totalOperations = operations.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white" style={{ borderBottom: '0.5px solid black' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Primera fila: Navegación y usuario */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 space-y-4 sm:space-y-0" style={{ borderBottom: '0.5px solid #d1d5db' }}>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-black">Relación de Open Deals</h1>
                  <p className="text-xs sm:text-sm text-gray-600">Portal de inversiones y oportunidades</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                    Mi Panel
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="outline" size="default" className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 h-auto border-black text-black hover:bg-gray-100">
                  Panel Admin
                </Button>
              </Link>
            </div>
          </div>

          {/* Segunda fila: Descripción y acción principal */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 sm:py-6 space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Oportunidades de Inversión</h2>
              <p className="text-base sm:text-lg text-gray-700">Descubre las mejores operaciones disponibles para inversión</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Contacta directamente para más información detallada</p>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <AddCompanyDialog />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-white">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          <div className="bg-white p-6 sm:p-8 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="flex items-center space-x-3 mb-3">
                  <p className="text-sm sm:text-base font-semibold text-black">Valor Total</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black mb-1">
                  €{(totalValue / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Portfolio completo</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[10px] hover:bg-gray-50 transition-all" style={{ border: '0.5px solid black' }}>
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="flex items-center space-x-3 mb-3">
                  <p className="text-sm sm:text-base font-semibold text-black">Disponibles</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black mb-1">{availableOperations}</p>
                <p className="text-xs sm:text-sm text-gray-600">Listas para inversión</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-[10px] hover:bg-gray-50 transition-all sm:col-span-2 lg:col-span-1" style={{ border: '0.5px solid black' }}>
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="flex items-center space-x-3 mb-3">
                  <p className="text-sm sm:text-base font-semibold text-black">Total Operaciones</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-black mb-1">{totalOperations}</p>
                <p className="text-xs sm:text-sm text-gray-600">En el portfolio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operations List with integrated filters */}
        <OperationsList />
      </div>
    </div>
  );
};

export default Index;
