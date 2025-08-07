import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  Archive, 
  Trash2, 
  Star,
  MoreVertical,
  Building,
  Target,
  User,
  Clock,
  Paperclip,
  X
} from 'lucide-react';
import { Email } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { IntelligentCompose } from './IntelligentCompose';

interface CrmEmailPreviewProps {
  email: Email | null;
  onClose: () => void;
  onReply?: (email: Email) => void;
  onForward?: (email: Email) => void;
}

export const CrmEmailPreview: React.FC<CrmEmailPreviewProps> = ({
  email,
  onClose,
  onReply,
  onForward
}) => {
  const [isReplying, setIsReplying] = useState(false);
  
  if (!email) {
    return (
      <div className="flex flex-col h-full bg-muted/10">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              📧
            </div>
            <p>Selecciona un email para ver su contenido</p>
          </div>
        </div>
      </div>
    );
  }

  const getCrmContextBadge = (email: Email) => {
    if (email.deal_id) {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
          <Building className="h-3 w-3 mr-1" />
          Deal ABC Corp - €450K
        </Badge>
      );
    }
    if (email.lead_id) {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
          <Target className="h-3 w-3 mr-1" />
          Lead: John Doe
        </Badge>
      );
    }
    if (email.contact_id) {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
          <User className="h-3 w-3 mr-1" />
          Contact: Tech Corp
        </Badge>
      );
    }
    return null;
  };

  if (isReplying) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Responder</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsReplying(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1">
          <IntelligentCompose
            toEmail={email.sender_email}
            subject={`Re: ${email.subject}`}
            originalEmail={email}
            onCancel={() => setIsReplying(false)}
            onSent={() => setIsReplying(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg truncate">{email.subject || '(Sin asunto)'}</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* CRM Context */}
        {getCrmContextBadge(email) && (
          <div className="mb-4">
            {getCrmContextBadge(email)}
          </div>
        )}

        {/* Sender info */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {email.sender_name?.slice(0, 2).toUpperCase() || 
               email.sender_email.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{email.sender_name || email.sender_email}</p>
                <p className="text-sm text-muted-foreground">{email.sender_email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(email.email_date), 'dd MMM yyyy', { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(email.email_date), 'HH:mm', { locale: es })}
                </p>
              </div>
            </div>
            
            {/* Recipients */}
            <div className="mt-2 text-sm text-muted-foreground">
              <span>Para: {email.recipient_emails.join(', ')}</span>
              {email.cc_emails && email.cc_emails.length > 0 && (
                <span className="block">CC: {email.cc_emails.join(', ')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsReplying(true)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Responder
          </Button>
          <Button variant="outline" size="sm">
            <ReplyAll className="h-4 w-4 mr-2" />
            Resp. a todos
          </Button>
          <Button variant="outline" size="sm">
            <Forward className="h-4 w-4 mr-2" />
            Reenviar
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="sm">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {email.has_attachments && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              <span>Este email contiene archivos adjuntos</span>
            </div>
          </div>
        )}

        <div className="prose prose-sm max-w-none">
          {email.body_html ? (
            <div 
              dangerouslySetInnerHTML={{ __html: email.body_html }}
              className="email-content"
            />
          ) : (
            <div className="whitespace-pre-wrap">
              {email.body_text}
            </div>
          )}
        </div>

        {/* Tracking info */}
        {email.tracking_pixel_url && (
          <div className="mt-6 p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email tracking habilitado</span>
              {email.opened_at && (
                <Badge variant="secondary" className="ml-2">
                  Abierto: {format(new Date(email.opened_at), 'dd/MM HH:mm')}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};