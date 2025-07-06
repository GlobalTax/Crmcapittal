import React from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { EInformaRatios } from '@/types/EInforma';

interface FinancialRatiosSectionProps {
  ratiosData: EInformaRatios[];
}

export const FinancialRatiosSection: React.FC<FinancialRatiosSectionProps> = ({ ratiosData }) => {
  const formatPercentage = (value: number | undefined | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toFixed(2);
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRatioColor = (value: number | undefined | null, type: 'positive' | 'negative' = 'positive') => {
    if (value === null || value === undefined) return 'text-gray-500';
    
    if (type === 'positive') {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    } else {
      return value < 50 ? 'text-green-600' : 'text-red-600';
    }
  };

  if (!ratiosData || ratiosData.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
        Ratios Financieros
      </h3>
      <div className="space-y-4">
        {ratiosData.map((ratios, index) => (
          <div key={index} className="bg-blue-50 p-4 rounded-lg">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-600">Ejercicio: </span>
              <span className="font-semibold">{ratios.ejercicio}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Rentabilidad */}
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Rentabilidad</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>ROE:</span>
                    <span className={getRatioColor(ratios.rentabilidad?.roe)}>
                      {formatPercentage(ratios.rentabilidad?.roe)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROA:</span>
                    <span className={getRatioColor(ratios.rentabilidad?.roa)}>
                      {formatPercentage(ratios.rentabilidad?.roa)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen Bruto:</span>
                    <span className={getRatioColor(ratios.rentabilidad?.margen_bruto)}>
                      {formatPercentage(ratios.rentabilidad?.margen_bruto)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margen Neto:</span>
                    <span className={getRatioColor(ratios.rentabilidad?.margen_neto)}>
                      {formatPercentage(ratios.rentabilidad?.margen_neto)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Liquidez */}
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Liquidez</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Ratio Corriente:</span>
                    <span className={getRatioColor(ratios.liquidez?.ratio_corriente)}>
                      {formatNumber(ratios.liquidez?.ratio_corriente)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio Rápido:</span>
                    <span className={getRatioColor(ratios.liquidez?.ratio_rapido)}>
                      {formatNumber(ratios.liquidez?.ratio_rapido)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capital Trabajo:</span>
                    <span className={getRatioColor(ratios.liquidez?.capital_trabajo)}>
                      {formatCurrency(ratios.liquidez?.capital_trabajo)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endeudamiento */}
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Endeudamiento</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Ratio Endeudamiento:</span>
                    <span className={getRatioColor(ratios.endeudamiento?.ratio_endeudamiento, 'negative')}>
                      {formatPercentage(ratios.endeudamiento?.ratio_endeudamiento)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio Autonomía:</span>
                    <span className={getRatioColor(ratios.endeudamiento?.ratio_autonomia)}>
                      {formatPercentage(ratios.endeudamiento?.ratio_autonomia)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cobertura Intereses:</span>
                    <span className={getRatioColor(ratios.endeudamiento?.cobertura_intereses)}>
                      {formatNumber(ratios.endeudamiento?.cobertura_intereses)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Eficiencia */}
              <div className="space-y-2">
                <h4 className="font-medium text-blue-800">Eficiencia</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Rotación Activos:</span>
                    <span className={getRatioColor(ratios.eficiencia?.rotacion_activos)}>
                      {formatNumber(ratios.eficiencia?.rotacion_activos)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotación Inventarios:</span>
                    <span className={getRatioColor(ratios.eficiencia?.rotacion_inventarios)}>
                      {formatNumber(ratios.eficiencia?.rotacion_inventarios)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>P.M. Cobro (días):</span>
                    <span>{formatNumber(ratios.eficiencia?.periodo_medio_cobro)}</span>
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