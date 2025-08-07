import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  MoreVertical,
  Clock,
  Paperclip,
  Eye,
  EyeOff,
  Mail,
  MailOpen
} from 'lucide-react';
import { EmailFilter } from '../types';
import { useEmails, useMarkAsRead, useToggleStar } from '../hooks/useEmails';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmailInboxProps {
  searchQuery: string;
  filter: EmailFilter;
}

export const EmailInbox: React.FC<EmailInboxProps> = ({ searchQuery, filter }) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  
  const { data: emails = [], isLoading } = useEmails({ 
    ...filter, 
    search: searchQuery 
  });
  
  const markAsReadMutation = useMarkAsRead();
  const toggleStarMutation = useToggleStar();

  const handleEmailClick = (emailId: string, isRead: boolean) => {
    setSelectedEmail(emailId);
    if (!isRead) {
      markAsReadMutation.mutate({ id: emailId, isRead: true });
    }
  };

  const handleStarToggle = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate(emailId);
  };

  const handleSelectEmail = (emailId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, emailId]);
    } else {
      setSelectedEmails(selectedEmails.filter(id => id !== emailId));
    }
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === emails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(emails.map(email => email.id));
    }
  };

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'opened': return 'bg-success text-success-foreground';
      case 'clicked': return 'bg-warning text-warning-foreground';
      case 'replied': return 'bg-primary text-primary-foreground';
      case 'bounced': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Lista de emails */}
      <div className={cn(
        "flex flex-col border-r",
        selectedEmail ? "w-1/3" : "w-full"
      )}>
        {/* Header de la lista */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              {filter.direction === 'incoming' ? 'Bandeja de entrada' : 'Emails enviados'}
            </h2>
            <div className="flex items-center gap-2">
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
          
          {emails.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={selectedEmails.length === emails.length}
                onChange={handleSelectAll}
                className="rounded"
              />
              <span>{emails.length} emails</span>
              {selectedEmails.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{selectedEmails.length} seleccionados</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Lista de emails */}
        <div className="flex-1 overflow-y-auto">
          {emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Mail className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay emails</h3>
              <p className="text-muted-foreground">
                {filter.direction === 'incoming' 
                  ? 'No tienes emails en tu bandeja de entrada' 
                  : 'No has enviado emails aún'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !email.is_read && "bg-muted/20",
                    selectedEmail === email.id && "bg-accent"
                  )}
                  onClick={() => handleEmailClick(email.id, email.is_read)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(email.id)}
                      onChange={(e) => handleSelectEmail(email.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 rounded"
                    />
                    
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {email.sender_name?.slice(0, 2).toUpperCase() || 
                         email.sender_email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium truncate",
                            !email.is_read && "font-semibold"
                          )}>
                            {email.sender_name || email.sender_email}
                          </span>
                          {email.has_attachments && (
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <time className="text-xs text-muted-foreground">
                            {format(new Date(email.email_date), 'HH:mm', { locale: es })}
                          </time>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => handleStarToggle(email.id, e)}
                          >
                            {email.is_starred ? (
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="h-3 w-3 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <p className={cn(
                        "text-sm mb-1 truncate",
                        !email.is_read ? "font-medium" : "text-muted-foreground"
                      )}>
                        {email.subject || '(Sin asunto)'}
                      </p>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {email.body_text?.replace(/\n/g, ' ').slice(0, 100)}...
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={getPriorityColor(email.status)}>
                          {email.status}
                        </Badge>
                        {email.tracking_pixel_url && (
                          <Badge variant="outline" className="text-xs">
                            Tracking
                          </Badge>
                        )}
                        {!email.is_read && (
                          <div className="h-2 w-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vista detalle del email */}
      {selectedEmail && (
        <div className="flex-1 flex flex-col">
          <EmailDetail 
            emailId={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        </div>
      )}
    </div>
  );
};

// Componente separado para el detalle del email
const EmailDetail: React.FC<{ emailId: string; onClose: () => void }> = ({ 
  emailId, 
  onClose 
}) => {
  // Este sería un hook específico para obtener el detalle del email
  // Por ahora mostramos un placeholder
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Detalle del Email</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>
      <div className="flex-1 p-4">
        <p className="text-muted-foreground">
          Aquí se mostraría el contenido completo del email con ID: {emailId}
        </p>
      </div>
    </div>
  );
};