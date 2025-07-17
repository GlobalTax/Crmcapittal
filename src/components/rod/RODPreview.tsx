import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Mail, Edit, FileText, Building, TrendingUp, Users, HandCoins } from 'lucide-react';
import { RODFormData } from '@/hooks/useRODFormState';
import { toast } from 'sonner';

interface RODPreviewProps {
  formData: RODFormData;
  onPrev: () => void;
  onGenerate: () => void;
}

export function RODPreview({ formData, onPrev, onGenerate }: RODPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const totalMandateValue = formData.mandates.reduce((sum, mandate) => sum + mandate.salesAmount, 0);
  const totalLeadValue = formData.leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
  const totalValue = totalMandateValue + totalLeadValue;
  const totalEbitda = formData.mandates.reduce((sum, mandate) => sum + (mandate.ebitda || 0), 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
      toast.success('ROD generada exitosamente');
    } catch (error) {
      toast.error('Error al generar la ROD');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderPreviewContent = () => {
    return (
      <div className="space-y-6 p-6 bg-white rounded-lg border">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {formData.generalInfo.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {formData.generalInfo.description}
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-500">
            <span>Cliente: {formData.generalInfo.client}</span>
            <span>•</span>
            <span>Período: {formData.generalInfo.period}</span>
            <span>•</span>
            <span>Generado: {new Date().toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formData.mandates.length + formData.leads.length}
            </div>
            <div className="text-sm text-gray-600">Total Elementos</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {formData.mandates.length}
            </div>
            <div className="text-sm text-gray-600">Mandatos de Venta</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {formData.leads.length}
            </div>
            <div className="text-sm text-gray-600">Leads Potenciales</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-2xl font-bold text-emerald-600">
              €{totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
        </div>

        {/* Mandates Section */}
        {formData.mandates.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-orange-500" />
              Mandatos de Venta ({formData.mandates.length})
            </h2>
            <div className="space-y-4">
              {formData.mandates.map((mandate, index) => (
                <div key={mandate.id} className="border-l-4 border-orange-500 bg-orange-50/50 p-4 rounded-r-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {index + 1}. {mandate.companyName}
                    </h3>
                    <Badge variant="outline">{mandate.sector}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Importe:</span>
                      <div className="font-medium text-green-600">€{mandate.salesAmount.toLocaleString()}</div>
                    </div>
                    {mandate.ebitda && (
                      <div>
                        <span className="text-gray-600">EBITDA:</span>
                        <div className="font-medium text-blue-600">€{mandate.ebitda.toLocaleString()}</div>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Ubicación:</span>
                      <div className="font-medium">{mandate.location}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <div className="font-medium">{mandate.status}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {mandate.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads Section */}
        {formData.leads.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Leads Potenciales ({formData.leads.length})
            </h2>
            <div className="space-y-4">
              {formData.leads.map((lead, index) => (
                <div key={lead.id} className="border-l-4 border-green-500 bg-green-50/50 p-4 rounded-r-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {index + 1}. {lead.companyName}
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline">{lead.sector}</Badge>
                      <Badge variant="outline">Score: {lead.leadScore}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Valor:</span>
                      <div className="font-medium text-green-600">€{lead.estimatedValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Fuente:</span>
                      <div className="font-medium">{lead.leadSource}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Estado:</span>
                      <div className="font-medium">{lead.qualificationStatus}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Contacto:</span>
                      <div className="font-medium">{lead.contactName}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {lead.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          Documento generado automáticamente • Template: {formData.generationSettings.template} • 
          Formato: {formData.generationSettings.outputFormat.toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Vista Previa de la ROD
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Revisa tu ROD antes de generar el documento final
          </p>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formData.mandates.length + formData.leads.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Elementos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formData.mandates.length}
            </div>
            <div className="text-sm text-muted-foreground">Mandatos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formData.leads.length}
            </div>
            <div className="text-sm text-muted-foreground">Leads</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">
              €{totalValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Valor Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preview del Documento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            {renderPreviewContent()}
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Configuración de Generación</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Template: {formData.generationSettings.template}</span>
                <span>•</span>
                <span>Formato: {formData.generationSettings.outputFormat.toUpperCase()}</span>
                <span>•</span>
                <span>Distribución: {formData.generationSettings.distributionMethod}</span>
                <span>•</span>
                <span>Logos: {formData.generationSettings.includeLogos ? 'Sí' : 'No'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => toast.info('Funcionalidad de edición pendiente')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8"
          >
            {isGenerating ? (
              'Generando...'
            ) : (
              <>
                {formData.generationSettings.distributionMethod === 'email' ? (
                  <Mail className="h-4 w-4 mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Generar ROD
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}