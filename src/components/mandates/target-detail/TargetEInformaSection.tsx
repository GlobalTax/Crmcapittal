import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Search, CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { MandateTarget, MandateTargetEnrichment } from '@/types/BuyingMandate';

interface TargetEInformaSectionProps {
  target: MandateTarget;
  enrichments: MandateTargetEnrichment[];
  isLoading: boolean;
  onEnrich: (nif: string) => void;
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

  const handleEnrich = () => {
    if (nif.trim()) {
      onEnrich(nif.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Consultar en eInforma
          </CardTitle>
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
            <div className="flex items-end">
              <Button 
                onClick={handleEnrich}
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
                    Consultar
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Introduce el NIF/CIF oficial de {target.company_name} para obtener 
              información actualizada del Registro Mercantil y datos financieros.
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

            {/* Financial Data */}
            {(enrichmentData.capital || enrichmentData.revenue || enrichmentData.employees) && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Datos Financieros</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enrichmentData.capital && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Capital Social</div>
                      <div className="font-bold text-blue-900">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                        }).format(enrichmentData.capital)}
                      </div>
                    </div>
                  )}
                  
                  {enrichmentData.revenue && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Facturación</div>
                      <div className="font-bold text-green-900">
                        {new Intl.NumberFormat('es-ES', {
                          style: 'currency',
                          currency: 'EUR',
                          minimumFractionDigits: 0,
                        }).format(enrichmentData.revenue)}
                      </div>
                    </div>
                  )}
                  
                  {enrichmentData.employees && (
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-600 mb-1">Empleados</div>
                      <div className="font-bold text-purple-900">{enrichmentData.employees}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Source Info */}
            <div className="border-t pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Fuente: eInforma</span>
                {latestEnrichment.confidence_score && (
                  <span>• Confianza: {Math.round(latestEnrichment.confidence_score * 100)}%</span>
                )}
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver en eInforma
              </Button>
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