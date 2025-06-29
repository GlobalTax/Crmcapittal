
import { useState, useEffect } from "react";
import { OperationsList } from "@/components/OperationsList";
import { AddCompanyDialog } from "@/components/AddCompanyDialog";
import { useOperations } from "@/hooks/useOperations";

interface PortfolioViewProps {
  showHeader?: boolean;
  showAddCompany?: boolean;
}

export const PortfolioView = ({ showHeader = true, showAddCompany = true }: PortfolioViewProps) => {
  const { operations, loading, error } = useOperations();

  // Calculate stats from all operations
  const totalValue = operations.reduce((sum, op) => sum + op.amount, 0);
  const availableOperations = operations.filter(op => op.status === "available").length;
  const totalOperations = operations.length;

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">Oportunidades de Inversión</h2>
            <p className="text-base sm:text-lg text-gray-700">Descubre las mejores operaciones disponibles para inversión</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Contacta directamente para más información detallada</p>
          </div>
          
          {showAddCompany && (
            <div className="flex justify-center lg:justify-end">
              <AddCompanyDialog />
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white p-4 sm:p-5 rounded-[10px]" style={{ border: '0.5px solid black' }}>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Valor Total</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black mb-1">
                €{(totalValue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-gray-600">Portfolio completo</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-[10px]" style={{ border: '0.5px solid black' }}>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Disponibles</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black mb-1">{availableOperations}</p>
              <p className="text-xs text-gray-600">Listas para inversión</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-[10px] sm:col-span-2 lg:col-span-1" style={{ border: '0.5px solid black' }}>
          <div className="flex items-center justify-between">
            <div className="w-full">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-xs sm:text-sm font-semibold text-black">Total Operaciones</p>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-black mb-1">{totalOperations}</p>
              <p className="text-xs text-gray-600">En el portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Operations List with integrated filters */}
      <OperationsList />
    </div>
  );
};
