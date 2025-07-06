import React from 'react';
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EInformaCreditInfo } from '@/types/EInforma';

interface CreditInfoSectionProps {
  creditInfo: EInformaCreditInfo;
}

export const CreditInfoSection: React.FC<CreditInfoSectionProps> = ({ creditInfo }) => {
  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getRiskColor = (nivel: string) => {
    switch (nivel) {
      case 'bajo': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'alto': return 'bg-orange-100 text-orange-800';
      case 'muy_alto': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!creditInfo) {
    return null;
  }

  const hasIncidencias = (creditInfo.incidencias?.protestos || 0) > 0 ||
                        (creditInfo.incidencias?.impagados || 0) > 0 ||
                        (creditInfo.incidencias?.concursos || 0) > 0 ||
                        (creditInfo.incidencias?.embargos || 0) > 0;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-purple-600" />
        Información Crediticia
      </h3>
      <div className="bg-purple-50 p-4 rounded-lg space-y-4">
        {/* Rating y Scoring */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <label className="text-sm font-medium text-gray-600">Rating Crediticio</label>
            <div className="mt-1">
              <Badge variant="outline" className="text-lg">
                {creditInfo.rating_crediticio || 'N/A'}
              </Badge>
            </div>
          </div>
          <div className="text-center">
            <label className="text-sm font-medium text-gray-600">Scoring</label>
            <div className="mt-1">
              <span className="text-2xl font-bold text-purple-600">
                {creditInfo.scoring_crediticio || 'N/A'}
              </span>
            </div>
          </div>
          <div className="text-center">
            <label className="text-sm font-medium text-gray-600">Nivel de Riesgo</label>
            <div className="mt-1">
              <Badge className={getRiskColor(creditInfo.nivel_riesgo || 'medio')}>
                {creditInfo.nivel_riesgo?.toUpperCase() || 'MEDIO'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Límite de Crédito */}
        {creditInfo.limite_credito_recomendado && (
          <div className="text-center border-t pt-3">
            <label className="text-sm font-medium text-gray-600">Límite de Crédito Recomendado</label>
            <div className="mt-1">
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(creditInfo.limite_credito_recomendado)}
              </span>
            </div>
          </div>
        )}

        {/* Incidencias */}
        {hasIncidencias && (
          <div className="border-t pt-3">
            <h4 className="font-medium text-red-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Incidencias Registradas
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {(creditInfo.incidencias?.protestos || 0) > 0 && (
                <div className="bg-red-100 p-2 rounded">
                  <span className="font-medium">Protestos:</span> {creditInfo.incidencias?.protestos}
                </div>
              )}
              {(creditInfo.incidencias?.impagados || 0) > 0 && (
                <div className="bg-red-100 p-2 rounded">
                  <span className="font-medium">Impagados:</span> {creditInfo.incidencias?.impagados}
                </div>
              )}
              {(creditInfo.incidencias?.concursos || 0) > 0 && (
                <div className="bg-red-100 p-2 rounded">
                  <span className="font-medium">Concursos:</span> {creditInfo.incidencias?.concursos}
                </div>
              )}
              {(creditInfo.incidencias?.embargos || 0) > 0 && (
                <div className="bg-red-100 p-2 rounded">
                  <span className="font-medium">Embargos:</span> {creditInfo.incidencias?.embargos}
                </div>
              )}
            </div>
            {creditInfo.incidencias?.fecha_ultima_incidencia && (
              <p className="text-xs text-gray-600 mt-2">
                Última incidencia: {new Date(creditInfo.incidencias.fecha_ultima_incidencia).toLocaleDateString('es-ES')}
              </p>
            )}
          </div>
        )}

        {/* Historial de Consultas */}
        {creditInfo.historial_consultas && (
          <div className="border-t pt-3">
            <h4 className="font-medium text-purple-800 mb-2">Historial de Consultas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Últimos 6 meses:</span> {creditInfo.historial_consultas.total_consultas_6m || 0} consultas
              </div>
              <div>
                <span className="font-medium">Último año:</span> {creditInfo.historial_consultas.total_consultas_12m || 0} consultas
              </div>
            </div>
          </div>
        )}

        {/* Evolución del Rating */}
        {creditInfo.evolucion_rating && creditInfo.evolucion_rating.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="font-medium text-purple-800 mb-2 flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              Evolución del Rating
            </h4>
            <div className="space-y-1 text-sm">
              {creditInfo.evolucion_rating.slice(0, 3).map((evolution, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span>{new Date(evolution.fecha).toLocaleDateString('es-ES')}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{evolution.rating}</Badge>
                    <span className="font-medium">{evolution.scoring}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 border-t pt-2">
          Consulta realizada el {new Date(creditInfo.fecha_consulta).toLocaleString('es-ES')}
        </div>
      </div>
    </div>
  );
};