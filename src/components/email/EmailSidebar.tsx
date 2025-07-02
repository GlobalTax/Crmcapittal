
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
            className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Edit className="h-4 w-4 mr-2" />
            Redactar Email
          </Button>
        </div>

        {/* Folders */}
        <ScrollArea className="email-list-content">
          <div className="p-4">
            <div className="space-y-2">
              {folders.map((folder) => {
                const Icon = folder.icon;
                const isSelected = selectedFolder === folder.id;
                
                return (
                  <Button
                    key={folder.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start px-4 py-3 h-auto text-left",
                      isSelected && "bg-blue-50 text-blue-700 border-blue-200 font-medium"
                    )}
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <Icon className={cn("h-5 w-5 mr-3", isSelected ? "text-blue-600" : folder.color)} />
                    <span className="flex-1">{folder.name}</span>
                    {folder.count > 0 && (
                      <Badge 
                        variant={isSelected ? "default" : "secondary"} 
                        className={cn(
                          "ml-2 text-xs",
                          isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {folder.count}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Additional Actions */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 h-auto text-muted-foreground"
                  disabled
                >
                  <Star className="h-5 w-5 mr-3" />
                  Destacados
                  <Badge variant="outline" className="ml-auto text-xs">
                    Próximamente
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 h-auto text-muted-foreground"
                  disabled
                >
                  <Archive className="h-5 w-5 mr-3" />
                  Archivados
                  <Badge variant="outline" className="ml-auto text-xs">
                    Próximamente
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 h-auto text-muted-foreground"
                  disabled
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  Papelera
                  <Badge variant="outline" className="ml-auto text-xs">
                    Próximamente
                  </Badge>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-muted-foreground text-center bg-gray-50 rounded-lg p-3">
            <Mail className="h-4 w-4 mx-auto mb-1 text-blue-600" />
            <div className="font-medium">Sistema de Email CRM</div>
            <div className="mt-1">Rastrea y gestiona tus comunicaciones</div>
          </div>
        </div>
      </div>
    </div>
  );
};
