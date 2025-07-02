
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Send, 
  Eye, 
  Archive, 
  Trash2, 
  Star, 
  Edit,
  Inbox,
  MailOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailSidebarProps {
  selectedFolder: string;
  onFolderSelect: (folder: string) => void;
  onCompose: () => void;
  emailCounts: {
    inbox: number;
    sent: number;
    unread: number;
  };
}

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  selectedFolder,
  onFolderSelect,
  onCompose,
  emailCounts
}) => {
  const folders = [
    {
      id: 'inbox',
      name: 'Bandeja de entrada',
      icon: Inbox,
      count: emailCounts.inbox,
      color: 'text-blue-600'
    },
    {
      id: 'sent',
      name: 'Enviados',
      icon: Send,
      count: emailCounts.sent,
      color: 'text-green-600'
    },
    {
      id: 'unread',
      name: 'No leídos',
      icon: MailOpen,
      count: emailCounts.unread,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="email-panel">
      <div className="email-panel-content">
        {/* Header */}
        <div className="email-list-header">
          <Button 
            onClick={onCompose}
            className="w-full justify-start"
            size="sm"
          >
            <Edit className="h-4 w-4 mr-2" />
            Redactar
          </Button>
        </div>

        {/* Folders */}
        <ScrollArea className="email-list-content">
          <div className="p-2">
            <div className="space-y-1">
              {folders.map((folder) => {
                const Icon = folder.icon;
                const isSelected = selectedFolder === folder.id;
                
                return (
                  <Button
                    key={folder.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start px-3 py-2 h-auto",
                      isSelected && "bg-muted font-medium"
                    )}
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <Icon className={cn("h-4 w-4 mr-3", folder.color)} />
                    <span className="flex-1 text-left">{folder.name}</span>
                    {folder.count > 0 && (
                      <Badge 
                        variant={isSelected ? "default" : "secondary"} 
                        className="ml-2 text-xs"
                      >
                        {folder.count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Additional Actions */}
            <div className="mt-6 pt-4 border-t">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto text-muted-foreground"
                  disabled
                >
                  <Star className="h-4 w-4 mr-3" />
                  Destacados
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto text-muted-foreground"
                  disabled
                >
                  <Archive className="h-4 w-4 mr-3" />
                  Archivados
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto text-muted-foreground"
                  disabled
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Papelera
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground text-center">
            Sistema de Email CRM
          </div>
        </div>
      </div>
    </div>
  );
};
