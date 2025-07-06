import React from 'react';
import { CheckCircle } from 'lucide-react';
import { EInformaBalanceSheet } from '@/types/EInforma';

interface FinancialBalanceSectionProps {
  balanceData: EInformaBalanceSheet[];
}

export const FinancialBalanceSection: React.FC<FinancialBalanceSectionProps> = ({ balanceData }) => {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!balanceData || balanceData.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
        Balance General
      </h3>
      <div className="space-y-4">
        {balanceData.map((balance, index) => (
          <div key={index} className="bg-green-50 p-4 rounded-lg">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Ejercicio: </span>
              <span className="font-semibold">{balance.ejercicio}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-800">ACTIVO</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Activo Corriente:</span>
                    <span>{formatCurrency(balance.activo_corriente)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activo No Corriente:</span>
                    <span>{formatCurrency(balance.activo_no_corriente)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>TOTAL ACTIVO:</span>
                    <span>{formatCurrency(balance.activo_total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-green-800">PASIVO Y PATRIMONIO</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Pasivo Corriente:</span>
                    <span>{formatCurrency(balance.pasivo_corriente)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pasivo No Corriente:</span>
                    <span>{formatCurrency(balance.pasivo_no_corriente)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Patrimonio Neto:</span>
                    <span>{formatCurrency(balance.patrimonio_neto)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>TOTAL PAS. + PAT.:</span>
                    <span>{formatCurrency(balance.pasivo_total + (balance.patrimonio_neto || 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};