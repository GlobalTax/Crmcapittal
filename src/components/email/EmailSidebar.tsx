
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Inbox, 
  Send, 
  Archive, 
  Trash2, 
  Star, 
  Tag, 
  Edit3,
  Mail
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

const folders = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, count: 'inbox' },
  { id: 'sent', label: 'Enviados', icon: Send, count: 'sent' },
  { id: 'drafts', label: 'Borradores', icon: Edit3, count: null },
  { id: 'archived', label: 'Archivados', icon: Archive, count: null },
  { id: 'starred', label: 'Destacados', icon: Star, count: null },
  { id: 'trash', label: 'Papelera', icon: Trash2, count: null },
];

const tags = [
  { id: 'leads', label: 'Leads', color: 'bg-blue-500' },
  { id: 'deals', label: 'Negocios', color: 'bg-green-500' },
  { id: 'companies', label: 'Empresas', color: 'bg-purple-500' },
  { id: 'urgent', label: 'Urgente', color: 'bg-red-500' },
];

export const EmailSidebar: React.FC<EmailSidebarProps> = ({
  selectedFolder,
  onFolderSelect,
  onCompose,
  emailCounts
}) => {
  return (
    <div className="h-full flex flex-col border-r bg-muted/10">
      {/* Header */}
      <div className="p-4 border-b">
        <Button onClick={onCompose} className="w-full">
          <Edit3 className="mr-2 h-4 w-4" />
          Redactar
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* Folders */}
        <div className="p-2">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Carpetas
          </div>
          <div className="space-y-1 mt-2">
            {folders.map((folder) => {
              const count = folder.count ? emailCounts[folder.count as keyof typeof emailCounts] : 0;
              return (
                <Button
                  key={folder.id}
                  variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start font-normal',
                    selectedFolder === folder.id && 'bg-secondary'
                  )}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  <folder.icon className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">{folder.label}</span>
                  {count > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="p-2 mt-4">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Etiquetas
          </div>
          <div className="space-y-1 mt-2">
            {tags.map((tag) => (
              <Button
                key={tag.id}
                variant="ghost"
                className="w-full justify-start font-normal"
                onClick={() => onFolderSelect(`tag:${tag.id}`)}
              >
                <div className={cn('mr-2 h-2 w-2 rounded-full', tag.color)} />
                <span>{tag.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {/* Stats */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <Mail className="mr-1 h-3 w-3" />
            <span>Total: {emailCounts.inbox}</span>
          </div>
          <div>
            No leídos: {emailCounts.unread}
          </dev>
        </div>
      </div>
    </div>
  );
};
