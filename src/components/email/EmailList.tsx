
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TrackedEmail } from '@/types/EmailTracking';
import { EmailStatusIndicator } from './EmailStatusIndicator';
import { Search, Mail, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar emails..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-gray-200"
              disabled
            />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Cargando emails...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header con búsqueda */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-gray-200"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <h2 className="font-medium text-gray-900">
            {selectedFolder === 'inbox' && 'Bandeja de entrada'}
            {selectedFolder === 'sent' && 'Enviados'}
            {selectedFolder === 'unread' && 'No leídos'}
          </h2>
          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
            {filteredEmails.length}
          </Badge>
        </div>
      </div>

      {/* Lista de emails */}
      <ScrollArea className="flex-1">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin emails</h3>
            <p className="text-sm text-gray-500">
              {emails.length === 0 
                ? "Aún no se han enviado emails desde el sistema"
                : "No se encontraron emails que coincidan con la búsqueda"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  selectedEmail?.id === email.id && "bg-blue-50 border-r-2 border-blue-600"
                )}
                onClick={() => onEmailSelect(email)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <EmailStatusIndicator 
                      status={email.status} 
                      size="sm"
                      showText={false}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {email.recipient_email}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(email.sent_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                      {email.subject || 'Sin asunto'}
                    </p>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {email.content 
                        ? email.content.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                        : 'Sin contenido'
                      }
                    </p>
                    
                    {email.open_count > 0 && (
                      <div className="mt-2">
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
  );
};
