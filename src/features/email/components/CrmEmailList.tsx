import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  MoreVertical,
  Clock,
  Paperclip,
  Mail,
  Building,
  Target,
  User
} from 'lucide-react';
import { Email, EmailFilter } from '../types';
import { useEmails, useMarkAsRead, useToggleStar } from '../hooks/useEmails';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CrmEmailListProps {
  searchQuery: string;
  filter: EmailFilter;
  selectedEmail: string | null;
  onEmailSelect: (emailId: string, email: Email) => void;
}

export const CrmEmailList: React.FC<CrmEmailListProps> = ({ 
  searchQuery, 
  filter, 
  selectedEmail, 
  onEmailSelect 
}) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  
  const { data: emails = [], isLoading } = useEmails({ 
    ...filter, 
    search: searchQuery 
  });
  
  const markAsReadMutation = useMarkAsRead();
  const toggleStarMutation = useToggleStar();

  const handleEmailClick = (emailId: string, email: Email) => {
    onEmailSelect(emailId, email);
    if (!email.is_read) {
      markAsReadMutation.mutate({ id: emailId, isRead: true });
    }
  };

  const handleStarToggle = (emailId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate(emailId);
  };

  const getCrmContextBadge = (email: Email) => {
    if (email.deal_id) {
      return (
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
          <Building className="h-3 w-3 mr-1" />
          Deal
        </Badge>
      );
    }
    if (email.lead_id) {
      return (
        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
          <Target className="h-3 w-3 mr-1" />
          Lead
        </Badge>
      );
    }
    if (email.contact_id) {
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
          <User className="h-3 w-3 mr-1" />
          Contact
        </Badge>
      );
    }
    return null;
  };

  const getCrmContextText = (email: Email) => {
    // This would be populated from joined data in the future
    if (email.deal_id) return "Re: Deal ABC Corp - €450K";
    if (email.lead_id) return "Contact: John Doe";
    if (email.contact_id) return "Client: Tech Corp";
    return null;
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
    <div className="flex flex-col h-full">
      {/* Header */}
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

      {/* Email List */}
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
                  "p-3 hover:bg-muted/50 cursor-pointer transition-colors border-l-2",
                  !email.is_read && "bg-muted/20 border-l-primary",
                  email.is_read && "border-l-transparent",
                  selectedEmail === email.id && "bg-accent border-l-accent-foreground",
                  getCrmContextBadge(email) && "pl-4"
                )}
                onClick={() => handleEmailClick(email.id, email)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {email.sender_name?.slice(0, 2).toUpperCase() || 
                       email.sender_email.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    {/* Header row with sender and time */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn(
                          "font-medium truncate",
                          !email.is_read && "font-semibold"
                        )}>
                          {email.sender_name || email.sender_email}
                        </span>
                        {email.has_attachments && (
                          <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                        {getCrmContextBadge(email)}
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
                    
                    {/* Subject */}
                    <p className={cn(
                      "text-sm mb-1 truncate",
                      !email.is_read ? "font-medium" : "text-muted-foreground"
                    )}>
                      {email.subject || '(Sin asunto)'}
                    </p>
                    
                    {/* CRM Context Line */}
                    {getCrmContextText(email) && (
                      <p className="text-xs text-primary/70 mb-1 truncate">
                        {getCrmContextText(email)}
                      </p>
                    )}
                    
                    {/* Preview text */}
                    <p className="text-xs text-muted-foreground truncate">
                      {email.body_text?.replace(/\n/g, ' ').slice(0, 80)}...
                    </p>

                    {/* Status indicators */}
                    <div className="flex items-center gap-2 mt-2">
                      {!email.is_read && (
                        <div className="h-2 w-2 bg-primary rounded-full" />
                      )}
                      {email.tracking_pixel_url && (
                        <Badge variant="outline" className="text-xs">
                          Tracking
                        </Badge>
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
  );
};