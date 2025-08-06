import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Lead } from '@/types/Lead';
import { 
  FileText, 
  Download, 
  Send, 
  Plus, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Euro,
  Edit2,
  Save,
  X,
  Calculator,
  Target,
  TrendingUp,
  Briefcase,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CreateProposalDialog } from '@/components/proposals/CreateProposalDialog';

interface LeadProposalTabEnhancedProps {
  lead: Lead;
}

type ServiceModel = 'valoracion' | 'mandato_fijo' | 'todo_exito';

interface ProposalFees {
  serviceModel: ServiceModel;
  // Modelo Valoración
  valoracionFee: number;
  // Modelo Mandato Fijo
  mandatoFixedFee: number;
  cuadernoVentaFee: number;
  mandatoSuccessPercentage: number;
  // Modelo Todo a Éxito
  successFeePercentage: number;
  successFeeVat: boolean;
  minimumFee: number;
  // Valor del deal
  dealValue: number;
  // Cálculos
  calculatedMinimumFee: number;
  calculatedSuccessFee: number;
  totalFees: number;
  notes: string;
}

interface MandateStatus {
  status: 'pending_creation' | 'in_preparation' | 'sent' | 'signed' | 'rejected';
  label: string;
}

export const LeadProposalTabEnhanced = ({ lead }: LeadProposalTabEnhancedProps) => {
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [isEditingFees, setIsEditingFees] = useState(false);
  
  // Estado para la propuesta de honorarios
  const [proposalFees, setProposalFees] = useState<ProposalFees>({
    serviceModel: 'todo_exito',
    // Valoración
    valoracionFee: 8000,
    // Mandato Fijo
    mandatoFixedFee: 15000,
    cuadernoVentaFee: 12000,
    mandatoSuccessPercentage: 3,
    // Todo a Éxito
    successFeePercentage: 5,
    successFeeVat: true,
    minimumFee: 15000,
    // Valor del deal (inicializado con el valor del lead)
    dealValue: lead.deal_value || 0,
    // Cálculos
    calculatedMinimumFee: 0,
    calculatedSuccessFee: 0,
    totalFees: 0,
    notes: 'Los honorarios se calculan según el modelo seleccionado y el valor de la transacción'
  });

  // Estado del mandato
  const [mandateStatus, setMandateStatus] = useState<MandateStatus>({
    status: 'pending_creation',
    label: 'Pendiente de Creación'
  });

  // Actualizar el valor del deal cuando cambie el lead
  useEffect(() => {
    if (lead.deal_value && lead.deal_value !== proposalFees.dealValue) {
      setProposalFees(prev => ({
        ...prev,
        dealValue: lead.deal_value || 0
      }));
    }
  }, [lead.deal_value]);

  // Calcular honorarios automáticamente cuando cambien los valores
  useEffect(() => {
    calculateFees();
  }, [proposalFees.serviceModel, proposalFees.dealValue, proposalFees.successFeePercentage, 
      proposalFees.valoracionFee, proposalFees.mandatoFixedFee, proposalFees.cuadernoVentaFee, 
      proposalFees.mandatoSuccessPercentage, proposalFees.minimumFee]);

  const calculateFees = () => {
    let calculatedMinimumFee = 0;
    let calculatedSuccessFee = 0;
    let totalFees = 0;

    switch (proposalFees.serviceModel) {
      case 'valoracion':
        calculatedMinimumFee = proposalFees.valoracionFee;
        calculatedSuccessFee = 0;
        totalFees = calculatedMinimumFee;
        break;
        
      case 'mandato_fijo':
        calculatedMinimumFee = proposalFees.mandatoFixedFee + proposalFees.cuadernoVentaFee;
        if (proposalFees.dealValue > 0) {
          calculatedSuccessFee = (proposalFees.dealValue * proposalFees.mandatoSuccessPercentage) / 100;
        }
        totalFees = calculatedMinimumFee + calculatedSuccessFee;
        break;
        
      case 'todo_exito':
        calculatedMinimumFee = proposalFees.minimumFee;
        if (proposalFees.dealValue > 0) {
          calculatedSuccessFee = (proposalFees.dealValue * proposalFees.successFeePercentage) / 100;
          totalFees = Math.max(calculatedMinimumFee, calculatedSuccessFee);
        } else {
          totalFees = calculatedMinimumFee;
        }
        break;
    }

    setProposalFees(prev => ({
      ...prev,
      calculatedMinimumFee,
      calculatedSuccessFee,
      totalFees
    }));
  };

  // Documentos disponibles para generar
  const documentTypes = [
    { id: 'sales_mandate', name: 'Generar Mandato de Venta', icon: FileText },
    { id: 'cover_letter', name: 'Carta de Presentación', icon: FileText },
    { id: 'general_conditions', name: 'Condiciones Generales', icon: FileText },
    { id: 'teaser', name: 'Teaser / Memorándum', icon: FileText }
  ];

  const handleGenerateProposal = () => {
    setIsProposalDialogOpen(true);
  };

  const handleSendProposal = () => {
    toast({
      title: "Enviar propuesta por email",
      description: "Se abrirá el compositor de email con la propuesta adjunta"
    });
  };

  const handleSaveFees = () => {
    setIsEditingFees(false);
    toast({
      title: "Honorarios actualizados",
      description: "Los cambios en la propuesta de honorarios han sido guardados"
    });
  };

  const handleGenerateDocument = (documentType: string) => {
    toast({
      title: `Generando ${documentTypes.find(d => d.id === documentType)?.name}`,
      description: "El documento se generará y estará disponible para descargar"
    });
  };

  const getServiceModelInfo = (model: ServiceModel) => {
    switch (model) {
      case 'valoracion':
        return {
          title: 'Valoración',
          description: 'Honorarios fijos por valoración de la empresa',
          icon: Target,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'mandato_fijo':
        return {
          title: 'Mandato con Fijo',
          description: 'Fijo inicial + éxito sobre transacción',
          icon: Briefcase,
          color: 'bg-purple-100 text-purple-800'
        };
      case 'todo_exito':
        return {
          title: 'Todo a Éxito',
          description: 'Solo éxito sobre transacción cerrada',
          icon: TrendingUp,
          color: 'bg-green-100 text-green-800'
        };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_creation': return 'bg-yellow-100 text-yellow-800';
      case 'in_preparation': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Valor del Deal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Valor del Deal
            <Badge variant="outline" className="ml-auto">
              {formatCurrency(proposalFees.dealValue)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="deal-value">Valor estimado de la transacción:</Label>
              <Input
                id="deal-value"
                type="number"
                value={proposalFees.dealValue}
                onChange={(e) => setProposalFees({
                  ...proposalFees, 
                  dealValue: parseFloat(e.target.value) || 0
                })}
                placeholder="0"
                className="mt-2"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <Info className="h-4 w-4 inline mr-1" />
              Este valor se usa para calcular los honorarios
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Propuesta de Honorarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Modelos de Honorarios
            {!isEditingFees && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditingFees(true)}
                className="ml-auto"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector de Modelo */}
          <div className="space-y-3">
            <Label>Modelo de Negocio:</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['valoracion', 'mandato_fijo', 'todo_exito'] as ServiceModel[]).map((model) => {
                const modelInfo = getServiceModelInfo(model);
                const IconComponent = modelInfo.icon;
                return (
                  <div
                    key={model}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      proposalFees.serviceModel === model 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setProposalFees({...proposalFees, serviceModel: model})}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{modelInfo.title}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{modelInfo.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Configuración específica por modelo */}
          {proposalFees.serviceModel === 'valoracion' && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Configuración - Valoración
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Honorarios por Valoración:</Label>
                  {isEditingFees ? (
                    <Input
                      type="number"
                      value={proposalFees.valoracionFee}
                      onChange={(e) => setProposalFees({
                        ...proposalFees, 
                        valoracionFee: parseFloat(e.target.value) || 0
                      })}
                      placeholder="8000"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {formatCurrency(proposalFees.valoracionFee)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Total a Cobrar:</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(proposalFees.totalFees)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {proposalFees.serviceModel === 'mandato_fijo' && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Configuración - Mandato con Fijo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fijo Mandato:</Label>
                  {isEditingFees ? (
                    <Input
                      type="number"
                      value={proposalFees.mandatoFixedFee}
                      onChange={(e) => setProposalFees({
                        ...proposalFees, 
                        mandatoFixedFee: parseFloat(e.target.value) || 0
                      })}
                      placeholder="15000"
                    />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposalFees.mandatoFixedFee)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Cuaderno de Venta:</Label>
                  {isEditingFees ? (
                    <Input
                      type="number"
                      value={proposalFees.cuadernoVentaFee}
                      onChange={(e) => setProposalFees({
                        ...proposalFees, 
                        cuadernoVentaFee: parseFloat(e.target.value) || 0
                      })}
                      placeholder="12000"
                    />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposalFees.cuadernoVentaFee)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>% Éxito sobre Deal:</Label>
                  {isEditingFees ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={proposalFees.mandatoSuccessPercentage}
                        onChange={(e) => setProposalFees({
                          ...proposalFees, 
                          mandatoSuccessPercentage: parseFloat(e.target.value) || 0
                        })}
                        className="w-20"
                      />
                      <span>%</span>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-primary">
                      {proposalFees.mandatoSuccessPercentage}%
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Total Estimado:</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(proposalFees.totalFees)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Fijo: {formatCurrency(proposalFees.calculatedMinimumFee)}<br/>
                    Éxito: {formatCurrency(proposalFees.calculatedSuccessFee)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {proposalFees.serviceModel === 'todo_exito' && (
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Configuración - Todo a Éxito
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>% Éxito sobre Deal:</Label>
                  {isEditingFees ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={proposalFees.successFeePercentage}
                        onChange={(e) => setProposalFees({
                          ...proposalFees, 
                          successFeePercentage: parseFloat(e.target.value) || 0
                        })}
                        className="w-20"
                      />
                      <span>%</span>
                      <label className="flex items-center gap-2 ml-4">
                        <Checkbox
                          checked={proposalFees.successFeeVat}
                          onCheckedChange={(checked) => setProposalFees({
                            ...proposalFees, 
                            successFeeVat: checked as boolean
                          })}
                        />
                        + IVA
                      </label>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-primary">
                      {proposalFees.successFeePercentage}%{proposalFees.successFeeVat ? ' + IVA' : ''}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Mínimo Garantizado:</Label>
                  {isEditingFees ? (
                    <Input
                      type="number"
                      value={proposalFees.minimumFee}
                      onChange={(e) => setProposalFees({
                        ...proposalFees, 
                        minimumFee: parseFloat(e.target.value) || 0
                      })}
                      placeholder="15000"
                    />
                  ) : (
                    <div className="text-lg font-semibold">
                      {formatCurrency(proposalFees.minimumFee)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Éxito Calculado:</Label>
                  <div className="text-lg font-semibold text-blue-600">
                    {formatCurrency(proposalFees.calculatedSuccessFee)}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Total a Cobrar:</Label>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(proposalFees.totalFees)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {proposalFees.calculatedSuccessFee > proposalFees.minimumFee 
                      ? 'Aplicando éxito calculado' 
                      : 'Aplicando mínimo garantizado'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notas */}
          {isEditingFees && (
            <div className="space-y-2">
              <Label>Notas:</Label>
              <Textarea
                value={proposalFees.notes}
                onChange={(e) => setProposalFees({...proposalFees, notes: e.target.value})}
                placeholder="Notas adicionales sobre los honorarios"
                rows={2}
              />
            </div>
          )}

          {/* Botones de acción */}
          {isEditingFees ? (
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditingFees(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveFees}
              >
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-4">
              <Button onClick={handleGenerateProposal}>
                <FileText className="h-4 w-4 mr-2" />
                Generar Propuesta
              </Button>
              <Button variant="outline" onClick={handleSendProposal}>
                <Send className="h-4 w-4 mr-2" />
                Enviar por Email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentos y Mandatos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos y Mandatos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado del Mandato */}
          <div className="space-y-2">
            <Label>Estado del Mandato:</Label>
            <Badge className={getStatusColor(mandateStatus.status)}>
              {mandateStatus.label}
            </Badge>
          </div>

          {/* Generación de documentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documentTypes.map((docType) => {
              const IconComponent = docType.icon;
              return (
                <Button
                  key={docType.id}
                  variant="outline"
                  onClick={() => handleGenerateDocument(docType.id)}
                  className="justify-start"
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {docType.name}
                </Button>
              );
            })}
          </div>

          {/* Documentos Adjuntos */}
          <div className="space-y-2 pt-4">
            <Label>Documentos Adjuntos:</Label>
            <div className="border rounded-lg p-4 text-center text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay documentos adjuntos</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="h-4 w-4 mr-1" />
                Adjuntar Documento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Propuesta */}
      <CreateProposalDialog 
        isOpen={isProposalDialogOpen} 
        onClose={() => setIsProposalDialogOpen(false)}
        leadId={lead.id}
        prefilledData={{
          title: `Propuesta de Servicios - ${lead.name}`,
          description: `Propuesta de ${getServiceModelInfo(proposalFees.serviceModel).title} para ${lead.name}${lead.company ? ` de ${lead.company}` : ''}`,
          total_amount: proposalFees.totalFees,
          notes: `Modelo: ${getServiceModelInfo(proposalFees.serviceModel).title} | Valor Deal: ${formatCurrency(proposalFees.dealValue)} | ${proposalFees.notes}`
        }}
      />
    </div>
  );
};