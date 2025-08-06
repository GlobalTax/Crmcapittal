import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Settings } from 'lucide-react';
import { useDocumentGenerator } from '@/hooks/useDocumentGenerator';
import type { Deal } from '@/types/Deal';
import type { 
  DocumentFormat, 
  DocumentVariables, 
  DOCUMENT_TYPE_LABELS 
} from '@/types/DocumentGenerator';

interface DocumentGeneratorDialogProps {
  deal: Deal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentGeneratorDialog = ({ deal, open, onOpenChange }: DocumentGeneratorDialogProps) => {
  const { templates, loading, generating, generateDocument, generateVariables } = useDocumentGenerator(deal);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [format, setFormat] = useState<DocumentFormat>('pdf');
  const [saveToOpportunity, setSaveToOpportunity] = useState(true);
  const [showVariables, setShowVariables] = useState(false);
  const [variables, setVariables] = useState<Partial<DocumentVariables>>({});
  const [baseVariables, setBaseVariables] = useState<DocumentVariables | null>(null);

  // Load base variables when dialog opens
  useEffect(() => {
    if (open) {
      generateVariables().then(setBaseVariables);
    }
  }, [open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedTemplateId('');
      setFormat('pdf');
      setSaveToOpportunity(true);
      setShowVariables(false);
      setVariables({});
      setBaseVariables(null);
    }
  }, [open]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  const handleGenerate = async () => {
    if (!selectedTemplateId) return;

    const success = await generateDocument({
      templateId: selectedTemplateId,
      variables,
      format,
      saveToOpportunity
    });

    if (success) {
      onOpenChange(false);
    }
  };

  const updateVariable = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const getVariableValue = (key: string): string => {
    if (variables[key as keyof DocumentVariables] !== undefined) {
      return variables[key as keyof DocumentVariables] || '';
    }
    return baseVariables?.[key as keyof DocumentVariables] || '';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Tipo de Documento</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>Cargando plantillas...</SelectItem>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.template_type.toUpperCase()}
                        </Badge>
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {selectedTemplate && (
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Formato de Salida</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as DocumentFormat)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF (Recomendado)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="docx" />
                <Label htmlFor="docx">DOCX (Word)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Save Option */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="save" 
              checked={saveToOpportunity} 
              onCheckedChange={(checked) => setSaveToOpportunity(checked === true)} 
            />
            <Label htmlFor="save">Guardar automáticamente en la oportunidad</Label>
          </div>

          <Separator />

          {/* Variable Preview */}
          {baseVariables && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Datos del Documento</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVariables(!showVariables)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {showVariables ? 'Ocultar' : 'Personalizar'}
                </Button>
              </div>

              {!showVariables ? (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Cliente</p>
                    <p className="text-sm text-muted-foreground">
                      {getVariableValue('client_name')} ({getVariableValue('company_name')})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Asesor</p>
                    <p className="text-sm text-muted-foreground">
                      {getVariableValue('advisor_name')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Operación</p>
                    <p className="text-sm text-muted-foreground">
                      {getVariableValue('deal_description')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Valor</p>
                    <p className="text-sm text-muted-foreground">
                      €{getVariableValue('deal_value')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Nombre del Cliente</Label>
                    <Input
                      id="client_name"
                      value={getVariableValue('client_name')}
                      onChange={(e) => updateVariable('client_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Nombre de la Empresa</Label>
                    <Input
                      id="company_name"
                      value={getVariableValue('company_name')}
                      onChange={(e) => updateVariable('company_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal_value">Valor de la Operación</Label>
                    <Input
                      id="deal_value"
                      value={getVariableValue('deal_value')}
                      onChange={(e) => updateVariable('deal_value', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={getVariableValue('sector')}
                      onChange={(e) => updateVariable('sector', e.target.value)}
                    />
                  </div>
                  
                  {/* Template-specific fields */}
                  {selectedTemplate?.template_type === 'proposal' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="commission_percentage">Porcentaje de Comisión (%)</Label>
                        <Input
                          id="commission_percentage"
                          value={getVariableValue('commission_percentage')}
                          onChange={(e) => updateVariable('commission_percentage', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_fee">Honorarios Mínimos (€)</Label>
                        <Input
                          id="minimum_fee"
                          value={getVariableValue('minimum_fee')}
                          onChange={(e) => updateVariable('minimum_fee', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedTemplate?.template_type === 'mandate' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="mandate_duration">Duración del Mandato (meses)</Label>
                        <Input
                          id="mandate_duration"
                          value={getVariableValue('mandate_duration')}
                          onChange={(e) => updateVariable('mandate_duration', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="exclusivity_clause">Cláusula de Exclusividad</Label>
                        <Textarea
                          id="exclusivity_clause"
                          value={getVariableValue('exclusivity_clause')}
                          onChange={(e) => updateVariable('exclusivity_clause', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={generating}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={!selectedTemplateId || generating}
            className="min-w-[140px]"
          >
            {generating ? (
              'Generando...'
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generar y Descargar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};