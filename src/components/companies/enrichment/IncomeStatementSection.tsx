import React from 'react';
import { CheckCircle } from 'lucide-react';
import { EInformaIncomeStatement } from '@/types/EInforma';

interface IncomeStatementSectionProps {
  incomeData: EInformaIncomeStatement[];
}

export const IncomeStatementSection: React.FC<IncomeStatementSectionProps> = ({ incomeData }) => {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (!incomeData || incomeData.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
        Cuenta de Resultados
      </h3>
      <div className="space-y-4">
        {incomeData.map((income, index) => (
          <div key={index} className="bg-orange-50 p-4 rounded-lg">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Ejercicio: </span>
              <span className="font-semibold">{income.ejercicio}</span>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-orange-800">INGRESOS</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Ingresos de Explotación:</span>
                      <span className="font-medium">{formatCurrency(income.ingresos_explotacion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ingresos Financieros:</span>
                      <span>{formatCurrency(income.ingresos_financieros)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-orange-800">GASTOS</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Consumos:</span>
                      <span>{formatCurrency(income.consumos_materias_primas)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos Personal:</span>
                      <span>{formatCurrency(income.gastos_personal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Otros Gastos:</span>
                      <span>{formatCurrency(income.otros_gastos_explotacion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amortizaciones:</span>
                      <span>{formatCurrency(income.amortizaciones)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-3">
                <h4 className="font-medium text-orange-800 mb-2">RESULTADOS</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>EBITDA:</span>
                      <span className="font-medium">{formatCurrency(income.ebitda)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resultado Explotación:</span>
                      <span className="font-medium">{formatCurrency(income.resultado_explotacion)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Resultado Financiero:</span>
                      <span className="font-medium">{formatCurrency(income.resultado_financiero)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Resultado Ejercicio:</span>
                      <span className="font-bold">{formatCurrency(income.resultado_ejercicio)}</span>
                    </div>
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