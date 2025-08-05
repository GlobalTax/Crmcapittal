import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/Lead';
import { 
  FileText, 
  Download, 
  Send, 
  Plus, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateProposalDialog } from '@/components/proposals/CreateProposalDialog';

interface LeadProposalTabProps {
  lead: Lead;
}

export const LeadProposalTab = ({ lead }: LeadProposalTabProps) => {
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);

  const handleGenerateProposal = () => {
    setIsProposalDialogOpen(true);
  };

  const handleSendProposal = () => {
    toast.info('Enviar propuesta', {
      description: 'Se abrirá el compositor de email con la propuesta adjunta'
    });
  };

  // Mock data for proposals
  const proposals = [
    {
      id: '1',
      title: 'Propuesta Inicial - Servicios de Consultoría',
      status: 'draft',
      createdAt: '2024-01-15',
      amount: 25000,
      validUntil: '2024-02-15'
    },
    {
      id: '2',
      title: 'Propuesta Revisada - Plan Premium',
      status: 'sent',
      createdAt: '2024-01-20',
      amount: 35000,
      validUntil: '2024-02-20'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'hsl(42, 100%, 50%)';
      case 'sent': return 'hsl(213, 94%, 68%)';
      case 'viewed': return 'hsl(280, 100%, 70%)';
      case 'accepted': return 'hsl(158, 100%, 38%)';
      case 'rejected': return 'hsl(4, 86%, 63%)';
      default: return 'hsl(210, 11%, 71%)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return Clock;
      case 'sent': return Send;
      case 'viewed': return CheckCircle;
      case 'accepted': return CheckCircle;
      case 'rejected': return AlertCircle;
      default: return FileText;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'sent': return 'Enviada';
      case 'viewed': return 'Vista';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      default: return 'Desconocido';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with main action */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Propuesta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Crear Nueva Propuesta</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Genera una propuesta personalizada para {lead.name} basada en sus necesidades y el valor estimado de {lead.deal_value ? formatCurrency(lead.deal_value) : 'la oportunidad'}.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleGenerateProposal} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Generar Propuesta
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Usar Plantilla
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Proposals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Propuestas Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay propuestas creadas para este lead</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const StatusIcon = getStatusIcon(proposal.status);
                return (
                  <div key={proposal.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{proposal.title}</h4>
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: getStatusColor(proposal.status),
                              color: getStatusColor(proposal.status)
                            }}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {getStatusLabel(proposal.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Creada: {formatDate(proposal.createdAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-primary">
                              {formatCurrency(proposal.amount)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Válida hasta: {formatDate(proposal.validUntil)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSendProposal}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Propuesta Estándar</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Plantilla básica para servicios de consultoría
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Usar Plantilla
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Propuesta Premium</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Plantilla completa con servicios extendidos
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Usar Plantilla
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Propuesta M&A</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Especializada en fusiones y adquisiciones
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Usar Plantilla
              </Button>
            </div>
            
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
              <h4 className="font-medium mb-2">Propuesta Personalizada</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Crear desde cero según necesidades específicas
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Crear Nueva
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Propuesta */}
      <CreateProposalDialog 
        isOpen={isProposalDialogOpen} 
        onClose={() => setIsProposalDialogOpen(false)} 
      />
    </div>
  );
};
