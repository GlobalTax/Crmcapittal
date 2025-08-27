import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { einformaService } from '@/services/einformaService';
import { Building2, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react';
import { Company } from '@/types/Company';
import { EInformaEnrichmentResult } from '@/types/EInforma';
import { FinancialBalanceSection } from './enrichment/FinancialBalanceSection';
import { IncomeStatementSection } from './enrichment/IncomeStatementSection';
import { FinancialRatiosSection } from './enrichment/FinancialRatiosSection';
import { CreditInfoSection } from './enrichment/CreditInfoSection';
import { logger } from '@/utils/productionLogger';

interface CompanyEnrichmentButtonProps {
  company: Company;
  onEnrichmentComplete?: (enrichmentData: EInformaEnrichmentResult) => void;
}

export const CompanyEnrichmentButton: React.FC<CompanyEnrichmentButtonProps> = ({
  company,
  onEnrichmentComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<EInformaEnrichmentResult | null>(null);
  const { toast } = useToast();

  const extractCIFFromCompany = (company: Company): string | null => {
    // Try to extract CIF from company name or other fields
    const cifRegex = /[ABCDEFGHJNPQRSUVW]\d{8}/g;
    
    // Check in company name
    const nameMatch = company.name.match(cifRegex);
    if (nameMatch) return nameMatch[0];
    
    // Check in description
    if (company.description) {
      const descMatch = company.description.match(cifRegex);
      if (descMatch) return descMatch[0];
    }
    
    return null;
  };

  const handleEnrichment = async () => {
    const cif = extractCIFFromCompany(company);
    
    if (!cif) {
      toast({
        title: "CIF no encontrado",
        description: "No se pudo encontrar un CIF válido para esta empresa. Asegúrate de que el nombre incluya el CIF.",
        variant: "destructive",
      });
      return;
    }

    if (!einformaService.validateCIF(cif)) {
      toast({
        title: "CIF inválido",
        description: `El CIF ${cif} no tiene un formato válido.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      logger.debug('Starting company enrichment with eInforma', { cif, companyId: company.id });
      
      const enrichmentResult = await einformaService.enrichCompany(cif);
      
      if (!enrichmentResult) {
        throw new Error('No se pudo obtener información de eInforma');
      }

      // Save to database
      const saved = await einformaService.saveEnrichmentResult(company.id, enrichmentResult);
      
      if (!saved) {
        logger.warn('Enrichment result could not be saved to database', { companyId: company.id, cif });
      }

      setEnrichmentData(enrichmentResult);
      setShowDialog(true);
      
      toast({
        title: "Enriquecimiento completado",
        description: `Empresa enriquecida con datos de eInforma (confianza: ${Math.round(enrichmentResult.confidence_score * 100)}%)`,
      });
      
      onEnrichmentComplete?.(enrichmentResult);
      
    } catch (error) {
      logger.error('eInforma enrichment process failed', { error, cif, companyId: company.id });
      toast({
        title: "Error en enriquecimiento",
        description: error instanceof Error ? error.message : "Error desconocido al conectar con eInforma",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const formatFinancialValue = (value: number | undefined) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <>
      <Button
        onClick={handleEnrichment}
        disabled={isLoading}
        size="sm"
        variant="outline"
        className="flex items-center space-x-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Building2 className="h-4 w-4" />
        )}
        <span>{isLoading ? 'Enriqueciendo...' : 'Enriquecer con eInforma'}</span>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Datos enriquecidos de eInforma</span>
              {enrichmentData && (
                <Badge className={getConfidenceColor(enrichmentData.confidence_score)}>
                  Confianza: {Math.round(enrichmentData.confidence_score * 100)}%
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {enrichmentData && (
            <div className="space-y-6">
              {/* Información básica */}
              {enrichmentData.company_data && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Información de la empresa
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-600">CIF</label>
                      <p className="text-sm">{enrichmentData.company_data.cif}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Razón Social</label>
                      <p className="text-sm">{enrichmentData.company_data.razon_social}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dirección</label>
                      <p className="text-sm">{enrichmentData.company_data.direccion}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Población</label>
                      <p className="text-sm">{enrichmentData.company_data.poblacion}, {enrichmentData.company_data.provincia}</p>
                    </div>
                    {enrichmentData.company_data.actividad_principal && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-600">Actividad Principal</label>
                        <p className="text-sm">{enrichmentData.company_data.actividad_principal}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Datos financieros */}
              {enrichmentData.financial_data && enrichmentData.financial_data.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Información financiera
                  </h3>
                  <div className="space-y-3">
                    {enrichmentData.financial_data.map((financial, index) => (
                      <div key={index} className="bg-blue-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Ejercicio</label>
                            <p className="text-sm font-semibold">{financial.ejercicio}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Ingresos</label>
                            <p className="text-sm">{formatFinancialValue(financial.ingresos_explotacion)}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Empleados</label>
                            <p className="text-sm">{financial.empleados || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance General */}
              {enrichmentData.balance_sheet && enrichmentData.balance_sheet.length > 0 && (
                <FinancialBalanceSection balanceData={enrichmentData.balance_sheet} />
              )}

              {/* Cuenta de Resultados */}
              {enrichmentData.income_statement && enrichmentData.income_statement.length > 0 && (
                <IncomeStatementSection incomeData={enrichmentData.income_statement} />
              )}

              {/* Ratios Financieros */}
              {enrichmentData.financial_ratios && enrichmentData.financial_ratios.length > 0 && (
                <FinancialRatiosSection ratiosData={enrichmentData.financial_ratios} />
              )}

              {/* Información Crediticia */}
              {enrichmentData.credit_info && (
                <CreditInfoSection creditInfo={enrichmentData.credit_info} />
              )}

              {/* Directivos */}
              {enrichmentData.directors && enrichmentData.directors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Directivos ({enrichmentData.directors.length})
                  </h3>
                  <div className="space-y-2">
                    {enrichmentData.directors.map((director, index) => (
                      <div key={index} className="bg-purple-50 p-3 rounded border-l-4 border-purple-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{director.nombre} {director.apellidos}</p>
                            <p className="text-sm text-gray-600">{director.cargo}</p>
                          </div>
                          {director.fecha_nombramiento && (
                            <p className="text-xs text-gray-500">
                              Desde: {new Date(director.fecha_nombramiento).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-100 rounded">
                <p className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  Datos obtenidos de eInforma el {new Date(enrichmentData.enrichment_date).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};