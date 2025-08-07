import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Send, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  FileText, 
  CreditCard,
  UserCheck
} from 'lucide-react';
import { Proposal } from '@/types/Proposal';
import { useToast } from '@/hooks/use-toast';

interface ProposalQuickActionsProps {
  proposal: Proposal;
  status: string;
}

export const ProposalQuickActions: React.FC<ProposalQuickActionsProps> = ({
  proposal,
  status
}) => {
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: `Acción: ${action}`,
      description: `Acción ${action} ejecutada para "${proposal.title}"`
    });
  };

  const getActionsForStatus = () => {
    switch (status) {
      case 'draft':
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('Editar')}
              className="h-8 px-3 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAction('Enviar')}
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-3 w-3 mr-1" />
              Enviar
            </Button>
          </div>
        );

      case 'sent':
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('Ver Status')}
              className="h-8 px-3 text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver Status
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('Seguimiento')}
              className="h-8 px-3 text-xs"
            >
              <UserCheck className="h-3 w-3 mr-1" />
              Seguimiento
            </Button>
          </div>
        );

      case 'in_review':
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('Ver Comentarios')}
              className="h-8 px-3 text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Comentarios
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleAction('Aprobar')}
              className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Aprobar
            </Button>
          </div>
        );

      case 'approved':
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('Ver PDF')}
              className="h-8 px-3 text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Ver PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('Facturar')}
              className="h-8 px-3 text-xs"
            >
              <CreditCard className="h-3 w-3 mr-1" />
              Facturar
            </Button>
          </div>
        );

      case 'rejected':
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('Ver Motivo')}
              className="h-8 px-3 text-xs"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Ver Motivo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('Duplicar')}
              className="h-8 px-3 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Duplicar
            </Button>
          </div>
        );

      default:
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction('Ver')}
            className="h-8 px-3 text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
        );
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status indicator for quick reference */}
      {proposal.views_count && proposal.views_count > 0 && status === 'sent' && (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
          Vista {proposal.views_count}x
        </Badge>
      )}
      
      {getActionsForStatus()}
    </div>
  );
};