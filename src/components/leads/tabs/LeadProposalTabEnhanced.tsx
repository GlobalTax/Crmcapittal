import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateProposalDialog } from '@/components/proposals/CreateProposalDialog';

interface LeadProposalTabEnhancedProps {
  lead: Lead;
}

interface ProposalFees {
  serviceType: string;
  successFeePercentage: number;
  successFeeVat: boolean;
  minimumFee: number;
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
    serviceType: 'mandato_venta',
    successFeePercentage: 5,
    successFeeVat: true,
    minimumFee: 15000,
    notes: 'Los honorarios se calculan sobre el precio final de venta'
  });

  // Estado del mandato
  const [mandateStatus, setMandateStatus] = useState<MandateStatus>({
    status: 'pending_creation',
    label: 'Pendiente de Creación'
  });

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
    toast.info('Enviar propuesta por email', {
      description: 'Se abrirá el compositor de email con la propuesta adjunta'
    });
  };

  const handleSaveFees = () => {
    setIsEditingFees(false);
    toast.success('Honorarios actualizados', {
      description: 'Los cambios en la propuesta de honorarios han sido guardados'
    });
  };

  const handleGenerateDocument = (documentType: string) => {
    toast.info(`Generando ${documentTypes.find(d => d.id === documentType)?.name}`, {
      description: 'El documento se generará y estará disponible para descargar'
    });
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Propuesta de Honorarios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Propuesta de Honorarios
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
        <CardContent className="space-y-4">
          {/* Tipo de Servicio */}
          <div className="space-y-2">
            <Label>Tipo de Servicio:</Label>
            {isEditingFees ? (
              <Select 
                value={proposalFees.serviceType} 
                onValueChange={(value) => setProposalFees({...proposalFees, serviceType: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mandato_venta">Mandato de Venta</SelectItem>
                  <SelectItem value="mandato_compra">Mandato de Compra</SelectItem>
                  <SelectItem value="consultoria">Consultoría</SelectItem>
                  <SelectItem value="valoracion">Valoración</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="text-primary font-medium">
                {proposalFees.serviceType === 'mandato_venta' && 'Mandato de Venta'}
                {proposalFees.serviceType === 'mandato_compra' && 'Mandato de Compra'}
                {proposalFees.serviceType === 'consultoria' && 'Consultoría'}
                {proposalFees.serviceType === 'valoracion' && 'Valoración'}
              </div>
            )}
          </div>

          {/* Honorarios de éxito */}
          <div className="space-y-2">
            <Label>Honorarios de éxito:</Label>
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
                  <input
                    type="checkbox"
                    checked={proposalFees.successFeeVat}
                    onChange={(e) => setProposalFees({
                      ...proposalFees, 
                      successFeeVat: e.target.checked
                    })}
                  />
                  + IVA
                </label>
              </div>
            ) : (
              <div className="text-primary font-semibold text-lg">
                {proposalFees.successFeePercentage}%{proposalFees.successFeeVat ? ' + IVA' : ''}
              </div>
            )}
          </div>

          {/* Honorarios mínimos */}
          <div className="space-y-2">
            <Label>Honorarios mínimos:</Label>
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
              <div className="text-primary font-semibold text-lg">
                {formatCurrency(proposalFees.minimumFee)}
              </div>
            )}
          </div>

          {/* Notas */}
          {isEditingFees ? (
            <div className="space-y-2">
              <Label>Notas:</Label>
              <Textarea
                value={proposalFees.notes}
                onChange={(e) => setProposalFees({...proposalFees, notes: e.target.value})}
                placeholder="Notas adicionales sobre los honorarios"
                rows={2}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              * {proposalFees.notes}
            </p>
          )}

          {/* Botones de acción para honorarios */}
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
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={handleGenerateProposal} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generar Propuesta Personalizada
              </Button>
              <Button variant="outline" onClick={handleSendProposal} className="w-full">
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
          <div className="space-y-3">
            {documentTypes.map((docType) => {
              const IconComponent = docType.icon;
              return (
                <Button
                  key={docType.id}
                  variant="outline"
                  onClick={() => handleGenerateDocument(docType.id)}
                  className="w-full justify-start"
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
          description: `Propuesta de ${proposalFees.serviceType.replace('_', ' ')} para ${lead.name}${lead.company ? ` de ${lead.company}` : ''}`,
          total_amount: proposalFees.minimumFee,
          notes: `Honorarios de éxito: ${proposalFees.successFeePercentage}%${proposalFees.successFeeVat ? ' + IVA' : ''} | ${proposalFees.notes}`
        }}
      />
    </div>
  );
};