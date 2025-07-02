
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrackedEmail } from '@/types/EmailTracking';
import { EmailStatusIndicator } from './EmailStatusIndicator';
import { Search, Mail, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import './email-styles.css';

interface EmailListProps {
  emails: TrackedEmail[];
  selectedEmail: TrackedEmail | null;
  onEmailSelect: (email: TrackedEmail) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFolder: string;
  isLoading: boolean;
}

export const EmailList: React.FC<EmailListProps> = ({
  emails,
  selectedEmail,
  onEmailSelect,
  searchQuery,
  onSearchChange,
  selectedFolder,
  isLoading
}) => {
  const filteredEmails = emails.filter(email => {
    const matchesSearch = !searchQuery || 
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.content?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder = selectedFolder === 'inbox' || 
      (selectedFolder === 'sent' && email.status === 'SENT') ||
      (selectedFolder === 'unread' && email.status !== 'OPENED');

    return matchesSearch && matchesFolder;
  });

  if (isLoading) {
    return (
      <div className="email-panel">
        <div className="email-panel-content">
          <div className="email-list-header">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar emails..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
                disabled
              />
            </div>
          </div>
          <div className="email-list-content flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Cargando emails...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="email-panel">
      <div className="email-panel-content">
        {/* Header con búsqueda */}
        <div className="email-list-header">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="font-semibold text-lg">
              {selectedFolder === 'inbox' && 'Bandeja de entrada'}
              {selectedFolder === 'sent' && 'Enviados'}
              {selectedFolder === 'unread' && 'No leídos'}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {filteredEmails.length}
            </Badge>
          </div>
        </div>

        {/* Lista de emails */}
        <ScrollArea className="email-list-content">
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              {emails.length === 0 ? (
                <>
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay emails</h3>
                  <p className="text-sm text-muted-foreground">
                    Aún no se han enviado emails desde el sistema
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sin resultados</h3>
                  <p className="text-sm text-muted-foreground">
                    No se encontraron emails que coincidan con la búsqueda
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedEmail?.id === email.id && "bg-muted"
                  )}
                  onClick={() => onEmailSelect(email)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <EmailStatusIndicator 
                        status={email.status} 
                        size="sm"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {email.recipient_email}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(email.sent_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium mb-1 truncate">
                        {email.subject || 'Sin asunto'}
                      </p>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {email.content 
                          ? email.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                          : 'Sin contenido'
                        }
                      </p>
                      
                      {email.open_count > 0 && (
                        <div className="mt-2 flex items-center">
                          <Badge variant="outline" className="text-xs">
                            Abierto {email.open_count} {email.open_count === 1 ? 'vez' : 'veces'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
