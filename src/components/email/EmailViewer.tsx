
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrackedEmail } from '@/types/EmailTracking';
import { EmailStatusIndicator } from '@/components/email/EmailStatusIndicator';
import { 
  Reply, 
  Forward, 
  Archive, 
  Trash2, 
  Star, 
  MoreHorizontal,
  Eye,
  MousePointer,
  Calendar,
  User,
  Building,
  AlertCircle,
  Mail
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import './email-styles.css';
import DOMPurify from 'dompurify';

interface EmailViewerProps {
  email: TrackedEmail | null;
  onReply: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export const EmailViewer: React.FC<EmailViewerProps> = ({
  email,
  onReply,
  onArchive,
  onDelete
}) => {
  if (!email) {
    return (
      <div className="email-panel">
        <div className="email-panel-content">
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">
                <Mail className="h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium mb-2">Selecciona un email</h3>
              <p className="text-sm">Elige un email de la lista para ver su contenido</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderEmailContent = () => {
    if (!email.content) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este email no tiene contenido disponible.
          </AlertDescription>
        </Alert>
      );
    }

    // Si es HTML, renderizar como HTML
    if (email.content.includes('<')) {
      return (
        <div
          className="email-content prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(email.content) }}
        />
      );
    }

    // Si es texto plano, convertir saltos de línea
    return (
      <div className="email-content prose prose-sm max-w-none">
        {email.content.split('\n').map((line, index) => (
          <p key={index}>{line || '\u00A0'}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="email-panel">
      <div className="email-panel-content">
        {/* Header */}
        <div className="email-viewer-header p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="font-semibold text-lg truncate">
                {email.subject || 'Sin asunto'}
              </h2>
              <EmailStatusIndicator status={email.status} />
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={onReply}>
                <Reply className="h-4 w-4 mr-1" />
                Responder
              </Button>
              <Button variant="outline" size="sm">
                <Forward className="h-4 w-4 mr-1" />
                Reenviar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Star className="mr-2 h-4 w-4" />
                    Destacar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Email Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Para:</span>
                <span>{email.recipient_email}</span>
              </div>
              <span className="text-muted-foreground">
                {format(new Date(email.sent_at), 'PPp', { locale: es })}
              </span>
            </div>
            
            {/* Context Badges */}
            <div className="flex items-center space-x-2">
              {email.lead_id && (
                <Badge variant="outline" className="text-xs">
                  <User className="mr-1 h-3 w-3" />
                  Lead
                </Badge>
              )}
              {email.contact_id && (
                <Badge variant="outline" className="text-xs">
                  <User className="mr-1 h-3 w-3" />
                  Contacto
                </Badge>
              )}
              {email.target_company_id && (
                <Badge variant="outline" className="text-xs">
                  <Building className="mr-1 h-3 w-3" />
                  Empresa
                </Badge>
              )}
              {email.operation_id && (
                <Badge variant="outline" className="text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  Operación
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tracking Stats */}
        <div className="p-4 border-b bg-muted/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="flex items-center justify-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-xs">Enviado</span>
              </div>
              <div className="text-sm font-medium">
                {formatDistanceToNow(new Date(email.sent_at), { 
                  addSuffix: true,
                  locale: es 
                })}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-center text-muted-foreground">
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-xs">Aperturas</span>
              </div>
              <div className="text-sm font-medium">
                {email.open_count} {email.open_count === 1 ? 'vez' : 'veces'}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center text-muted-foreground">
                <MousePointer className="h-4 w-4 mr-1" />
                <span className="text-xs">Estado</span>
              </div>
              <div className="text-sm font-medium">
                {email.status === 'SENT' && 'Enviado'}
                {email.status === 'OPENED' && 'Abierto'}
                {email.status === 'CLICKED' && 'Clic'}
              </div>
            </div>
          </div>
          
          {email.opened_at && (
            <div className="text-center mt-2 text-xs text-muted-foreground">
              Último abrir: {format(new Date(email.opened_at), 'PPp', { locale: es })}
            </div>
          )}
        </div>

        {/* Email Content */}
        <ScrollArea className="email-viewer-content p-4">
          {renderEmailContent()}
        </ScrollArea>
      </div>
    </div>
  );
};
