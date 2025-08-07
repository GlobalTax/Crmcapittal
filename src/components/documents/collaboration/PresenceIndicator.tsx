import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useDocumentPresence } from '@/hooks/useDocumentPresence';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PresenceIndicatorProps {
  documentId: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ documentId }) => {
  const { activeUsers } = useDocumentPresence(documentId);

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return email ? email[0].toUpperCase() : '?';
  };

  const getUserName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.email || 'Usuario desconocido';
  };

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
        <Users className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-1">
          {activeUsers.slice(0, 3).map((presence, index) => (
            <Tooltip key={presence.id}>
              <TooltipTrigger>
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {getInitials(
                      presence.user?.first_name,
                      presence.user?.last_name,
                      presence.user?.email
                    )}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getUserName(presence.user)}</p>
                <p className="text-xs text-muted-foreground">Editando ahora</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {activeUsers.length > 3 && (
            <Badge variant="secondary" className="h-6 w-6 p-0 text-xs">
              +{activeUsers.length - 3}
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {activeUsers.length === 1 
            ? '1 persona editando' 
            : `${activeUsers.length} personas editando`
          }
        </span>
      </div>
    </TooltipProvider>
  );
};