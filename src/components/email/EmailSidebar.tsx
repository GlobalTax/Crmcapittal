
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
  Edit
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
      icon: Mail,
      count: emailCounts.inbox,
    },
    {
      id: 'sent',
      name: 'Enviados',
      icon: Send,
      count: emailCounts.sent,
    },
    {
      id: 'unread',
      name: 'No leídos',
      icon: Eye,
      count: emailCounts.unread,
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Botón de redactar */}
      <div className="p-4">
        <Button 
          onClick={onCompose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          <Edit className="h-4 w-4 mr-2" />
          Redactar
        </Button>
      </div>

      {/* Lista de carpetas */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          <div className="space-y-1">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isSelected = selectedFolder === folder.id;
              
              return (
                <Button
                  key={folder.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-3 py-2 h-auto text-left font-normal",
                    isSelected && "bg-blue-50 text-blue-700 font-medium"
                  )}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="flex-1">{folder.name}</span>
                  {folder.count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs bg-gray-100 text-gray-600"
                    >
                      {folder.count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Separador */}
          <div className="my-4 border-t border-gray-200"></div>

          {/* Acciones adicionales */}
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
      </ScrollArea>
    </div>
  );
};
