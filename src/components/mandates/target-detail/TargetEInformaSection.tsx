import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Search, CheckCircle, AlertTriangle, Loader2, ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { MandateTarget, MandateTargetEnrichment } from '@/types/BuyingMandate';

interface TargetEInformaSectionProps {
  target: MandateTarget;
  enrichments: MandateTargetEnrichment[];
  isLoading: boolean;
  onEnrich: (nif: string, forceUpdate?: boolean) => void;
}

export const TargetEInformaSection = ({ 
  target, 
  enrichments, 
  isLoading, 
  onEnrich 
}: TargetEInformaSectionProps) => {
  const [nif, setNif] = useState('');
  
  const latestEnrichment = enrichments[0];
  const enrichmentData = latestEnrichment?.enrichment_data;
  
  // Check if we have recent data
  const hasEnrichments = enrichments.length > 0;
  const lastEnrichmentDate = latestEnrichment ? new Date(latestEnrichment.enriched_at) : null;
  const hoursAgo = lastEnrichmentDate ? Math.round((Date.now() - lastEnrichmentDate.getTime()) / (1000 * 60 * 60)) : 0;
  const isRecent = hasEnrichments && hoursAgo < 24;

  const handleEnrich = (forceUpdate = false) => {
    if (nif.trim()) {
      onEnrich(nif.trim(), forceUpdate);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Consultando...';
    if (hasEnrichments) return isRecent ? 'Actualizar datos' : 'Consultar actualización';
    return 'Consultar por primera vez';
  };

  const getStatusBadge = () => {
    if (!hasEnrichments) return null;
    
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        isRecent 
          ? 'bg-green-100 text-green-800' 
          : 'bg-yellow-100 text-yellow-800'
      }`}>
        <CheckCircle className="h-3 w-3" />
        {isRecent ? '✅ Datos actualizados' : '⚠️ Datos antiguos'}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Consultar en eInforma
            </div>
            {getStatusBadge()}
          </CardTitle>
          {hasEnrichments && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Última consulta: {lastEnrichmentDate?.toLocaleString('es-ES')}
              {hoursAgo > 0 && ` (hace ${hoursAgo}h)`}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="nif">NIF/CIF de la empresa</Label>
              <Input
                id="nif"
                placeholder="Ej: B12345678"
                value={nif}
                onChange={(e) => setNif(e.target.value.toUpperCase())}
                className="mt-1"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={() => handleEnrich(false)}
                disabled={!nif.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    {getButtonText()}
                  </>
                )}
              </Button>
              {hasEnrichments && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleEnrich(true)}
                  disabled={!nif.trim() || isLoading}
                  title="Forzar actualización ignorando consultas recientes"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Introduce el NIF/CIF oficial de {target.company_name} para obtener 
              información actualizada del Registro Mercantil y datos financieros.
              {hasEnrichments && isRecent && (
                <span className="block mt-1 text-green-700">
                  ✅ Ya tienes datos recientes. Usa el botón de actualización si necesitas datos más actuales.
                </span>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Enrichment Data */}
      {latestEnrichment && enrichmentData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Datos de eInforma
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Última consulta: {new Date(latestEnrichment.enriched_at).toLocaleString('es-ES')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrichmentData.name && (
                <div>
                  <Label className="text-xs text-muted-foreground">Razón Social</Label>
                  <div className="font-medium">{enrichmentData.name}</div>
                </div>
              )}
              
              {enrichmentData.nif && (
                <div>
                  <Label className="text-xs text-muted-foreground">NIF/CIF</Label>
                  <div className="font-medium">{enrichmentData.nif}</div>
                </div>
              )}
              
              {enrichmentData.status && (
                <div>
                  <Label className="text-xs text-muted-foreground">Estado</Label>
                  <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    enrichmentData.status === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {enrichmentData.status}
                  </div>
                </div>
              )}
              
              {enrichmentData.business_sector && (
                <div>
                  <Label className="text-xs text-muted-foreground">Sector</Label>
                  <div className="font-medium">{enrichmentData.business_sector}</div>
                </div>
              )}
            </div>

            {/* Address */}
            {(enrichmentData.address_street || enrichmentData.address_city) && (
              <div>
                <Label className="text-xs text-muted-foreground">Dirección</Label>
                <div className="font-medium">
                  {[
                    enrichmentData.address_street,
                    enrichmentData.address_city,
                    enrichmentData.address_postal_code
                  ].filter(Boolean).join(', ')}
                </div>
              </div>
            )}

            {/* Legal Representative */}
            {enrichmentData.legal_representative && (
              <div>
                <Label className="text-xs text-muted-foreground">Representante Legal</Label>
                <div className="font-medium">{enrichmentData.legal_representative}</div>
              </div>
            )}

            {/* Key Metrics Summary */}
            {(enrichmentData.capital || enrichmentData.revenue || enrichmentData.employees || enrichmentData.cnae || enrichmentData.risk_score) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  📊 Resumen Financiero
                  <div className="flex-1 h-px bg-gray-200"></div>
                </h4>
                
                {/* Key Financial Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {enrichmentData.revenue && (
                    <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">💰 Ingresos Anuales</div>
                      <div className="font-bold text-lg text-green-900">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(enrichmentData.revenue)}
                      </div>
                    </div>
                  )}
                  
                  {enrichmentData.ebitda && (
                    <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">📈 EBITDA</div>
                      <div className="font-bold text-lg text-blue-900">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(enrichmentData.ebitda)}
                      </div>
                      {enrichmentData.revenue && (
                        <div className="text-xs text-blue-700 mt-1">
                          {((enrichmentData.ebitda / enrichmentData.revenue) * 100).toFixed(1)}% margen
                        </div>
                      )}
                    </div>
                  )}
                  
                  {enrichmentData.employees && (
                    <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-sm text-purple-600 mb-1">👥 Empleados</div>
                      <div className="font-bold text-lg text-purple-900">{enrichmentData.employees}</div>
                      {enrichmentData.revenue && (
                        <div className="text-xs text-purple-700 mt-1">
                          {Math.round(enrichmentData.revenue / enrichmentData.employees).toLocaleString('es-ES')}€/empleado
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Additional Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enrichmentData.capital && (
                    <div className="text-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">🏦 Capital Social</div>
                      <div className="font-bold text-gray-900">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                        }).format(enrichmentData.capital)}
                      </div>
                    </div>
                  )}
                  
                  {enrichmentData.cnae && (
                    <div className="text-center p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <div className="text-sm text-indigo-600 mb-1">🏷️ CNAE</div>
                      <div className="font-bold text-indigo-900">{enrichmentData.cnae}</div>
                    </div>
                  )}
                  
                  {enrichmentData.founded_year && (
                    <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="text-sm text-orange-600 mb-1">📅 Año Fundación</div>
                      <div className="font-bold text-orange-900">{enrichmentData.founded_year}</div>
                      <div className="text-xs text-orange-700 mt-1">
                        {new Date().getFullYear() - enrichmentData.founded_year} años
                      </div>
                    </div>
                  )}
                </div>

                {/* Risk Assessment */}
                {enrichmentData.risk_score !== undefined && (
                  <div className="mt-4 p-3 rounded-lg border" 
                       style={{
                         backgroundColor: enrichmentData.risk_score < 3 ? '#f0fdf4' : enrichmentData.risk_score < 7 ? '#fffbeb' : '#fef2f2',
                         borderColor: enrichmentData.risk_score < 3 ? '#bbf7d0' : enrichmentData.risk_score < 7 ? '#fed7aa' : '#fecaca'
                       }}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        🎯 Nivel de Riesgo: {enrichmentData.risk_score}/10
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        enrichmentData.risk_score < 3 
                          ? 'bg-green-200 text-green-800' 
                          : enrichmentData.risk_score < 7 
                            ? 'bg-yellow-200 text-yellow-800' 
                            : 'bg-red-200 text-red-800'
                      }`}>
                        {enrichmentData.risk_score < 3 ? 'Bajo' : enrichmentData.risk_score < 7 ? 'Medio' : 'Alto'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Data Completeness & Source */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📡 Fuente: eInforma</span>
                  {latestEnrichment.confidence_score && (
                    <span>• Confianza: {Math.round(latestEnrichment.confidence_score * 100)}%</span>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Ver en eInforma
                </Button>
              </div>
              
              {/* Data Completeness Indicator */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Completitud de datos</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(
                      (Object.values(enrichmentData).filter(v => v !== null && v !== undefined && v !== '').length / 
                       Object.keys(enrichmentData).length) * 100
                    )}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{
                      width: `${Math.round(
                        (Object.values(enrichmentData).filter(v => v !== null && v !== undefined && v !== '').length / 
                         Object.keys(enrichmentData).length) * 100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {enrichments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Sin datos de eInforma</h3>
            <p className="text-muted-foreground mb-4">
              Consulta la información oficial de {target.company_name} en eInforma
            </p>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Realizar Primera Consulta
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Historical Enrichments */}
      {enrichments.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enrichments.slice(1, 6).map((enrichment, index) => (
                <div key={enrichment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium text-sm">
                      Consulta {enrichments.length - index - 1}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(enrichment.enriched_at).toLocaleString('es-ES')}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver datos
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};