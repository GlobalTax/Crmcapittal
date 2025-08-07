import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Copy, 
  Send, 
  FileText, 
  Download,
  Mail,
  Trash2,
  Archive,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Proposal } from '@/types/Proposal';

interface QuickActionsMenuProps {
  proposal: Proposal;
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onSend: () => void;
  onDownloadPDF: () => void;
  onSendEmail: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkApproved?: () => void;
  onMarkRejected?: () => void;
}

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  proposal,
  onView,
  onEdit,
  onDuplicate,
  onSend,
  onDownloadPDF,
  onSendEmail,
  onArchive,
  onDelete,
  onMarkApproved,
  onMarkRejected
}) => {
  const canSend = proposal.status === 'draft';
  const canApprove = proposal.status === 'sent' || proposal.status === 'in_review';
  const canReject = proposal.status === 'sent' || proposal.status === 'in_review';
  const isExpired = proposal.valid_until && new Date(proposal.valid_until) < new Date();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {/* Acciones principales */}
        <DropdownMenuItem onClick={onView}>
          <Eye className="h-4 w-4 mr-2" />
          Ver detalles
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar propuesta
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Acciones de estado */}
        {canSend && (
          <DropdownMenuItem onClick={onSend}>
            <Send className="h-4 w-4 mr-2" />
            Enviar al cliente
          </DropdownMenuItem>
        )}

        {canApprove && onMarkApproved && (
          <DropdownMenuItem onClick={onMarkApproved}>
            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
            Marcar como aprobada
          </DropdownMenuItem>
        )}

        {canReject && onMarkRejected && (
          <DropdownMenuItem onClick={onMarkRejected}>
            <Clock className="h-4 w-4 mr-2 text-red-600" />
            Marcar como rechazada
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Acciones de documento */}
        <DropdownMenuItem onClick={onDownloadPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Ver PDF
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Descargar PDF
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onSendEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Enviar por email
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Acciones de gestión */}
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicar propuesta
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onArchive}>
          <Archive className="h-4 w-4 mr-2" />
          Archivar
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Acción destructiva */}
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar
        </DropdownMenuItem>

        {/* Indicadores de estado */}
        {isExpired && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <Badge variant="destructive" className="text-xs">
                Propuesta expirada
              </Badge>
            </div>
          </>
        )}

        {proposal.views_count && proposal.views_count > 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            {proposal.views_count} visualizaciones
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};