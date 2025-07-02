
import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrackedEmail } from '@/types/EmailTracking';
import { EmailStatusIndicator } from '@/components/email/EmailStatusIndicator';
import { Search, MoreHorizontal, Archive, Trash2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by folder
    switch (selectedFolder) {
      case 'sent':
        filtered = emails.filter(email => email.status === 'SENT');
        break;
      case 'inbox':
        filtered = emails;
        break;
      // Add more folder filters as needed
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(email =>
        email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }, [emails, selectedFolder, searchQuery]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col border-r">
      {/* Search Header */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar emails..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Email List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Cargando emails...
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? 'No se encontraron emails' : 'No hay emails'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={cn(
                  'p-4 cursor-pointer hover:bg-muted/50 transition-colors',
                  selectedEmail?.id === email.id && 'bg-muted'
                )}
                onClick={() => onEmailSelect(email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm truncate">
                          {email.recipient_email}
                        </span>
                        <EmailStatusIndicator status={email.status} />
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(email.sent_at), { 
                            addSuffix: true,
                            locale: es 
                          })}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Star className="mr-2 h-4 w-4" />
                              Destacar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archivar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-1">
                      <span className="text-sm font-medium">
                        {email.subject || 'Sin asunto'}
                      </span>
                    </div>

                    {/* Preview */}
                    <div className="text-xs text-muted-foreground">
                      {email.content ? truncateText(email.content.replace(/<[^>]*>/g, ''), 100) : 'Sin contenido'}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center mt-2 space-x-2">
                      {email.open_count > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Abierto {email.open_count} {email.open_count === 1 ? 'vez' : 'veces'}
                        </Badge>
                      )}
                      {email.lead_id && (
                        <Badge variant="outline" className="text-xs">
                          Lead
                        </Badge>
                      )}
                      {email.contact_id && (
                        <Badge variant="outline" className="text-xs">
                          Contacto
                        </Badge>
                      )}
                    </div>
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
