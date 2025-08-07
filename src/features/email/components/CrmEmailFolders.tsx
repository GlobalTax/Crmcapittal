import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Inbox, 
  Send, 
  Users, 
  FileText, 
  Star, 
  Archive,
  Clock,
  Building
} from 'lucide-react';

interface CrmEmailFoldersProps {
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  folderCounts: Record<string, number>;
}

export const CrmEmailFolders: React.FC<CrmEmailFoldersProps> = ({
  activeFolder,
  onFolderChange,
  folderCounts
}) => {
  const folders = [
    { 
      id: 'inbox', 
      label: 'Bandeja de entrada', 
      icon: Inbox, 
      count: folderCounts.inbox || 0 
    },
    { 
      id: 'sent', 
      label: 'Enviados', 
      icon: Send, 
      count: folderCounts.sent || 0 
    },
    { 
      id: 'crm-linked', 
      label: 'CRM Vinculados', 
      icon: Users, 
      count: folderCounts.crmLinked || 0 
    },
    { 
      id: 'templates', 
      label: 'Templates', 
      icon: FileText, 
      count: folderCounts.templates || 0 
    },
    { 
      id: 'scheduled', 
      label: 'Programados', 
      icon: Clock, 
      count: folderCounts.scheduled || 0 
    },
  ];

  const quickFilters = [
    { 
      id: 'starred', 
      label: 'Destacados', 
      icon: Star, 
      count: folderCounts.starred || 0 
    },
    { 
      id: 'deals', 
      label: 'Con Deals', 
      icon: Building, 
      count: folderCounts.deals || 0 
    },
    { 
      id: 'archived', 
      label: 'Archivados', 
      icon: Archive, 
      count: folderCounts.archived || 0 
    },
  ];

  return (
    <div className="w-60 border-r bg-muted/20 p-4 flex flex-col h-full">
      {/* Main Folders */}
      <div className="space-y-1">
        {folders.map((folder) => {
          const IconComponent = folder.icon;
          return (
            <Button
              key={folder.id}
              variant={activeFolder === folder.id ? "secondary" : "ghost"}
              className="w-full justify-start h-9 px-3"
              onClick={() => onFolderChange(folder.id)}
            >
              <IconComponent className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left truncate">{folder.label}</span>
              {folder.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 h-5 px-1.5 text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {folder.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      <Separator className="my-4" />

      {/* Quick Filters */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground mb-2 px-3">
          Filtros CRM
        </p>
        {quickFilters.map((filter) => {
          const IconComponent = filter.icon;
          return (
            <Button
              key={filter.id}
              variant={activeFolder === filter.id ? "secondary" : "ghost"}
              className="w-full justify-start h-8 px-3 text-sm"
              onClick={() => onFolderChange(filter.id)}
            >
              <IconComponent className="h-3.5 w-3.5 mr-3 flex-shrink-0" />
              <span className="flex-1 text-left truncate">{filter.label}</span>
              {filter.count > 0 && (
                <Badge 
                  variant="outline" 
                  className="ml-2 h-4 px-1 text-xs"
                >
                  {filter.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* CRM Context Shortcuts */}
      <Separator className="my-4" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground mb-2 px-3">
          Contexto CRM
        </p>
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-3 text-sm text-muted-foreground"
          onClick={() => onFolderChange('recent-deals')}
        >
          <Building className="h-3.5 w-3.5 mr-3" />
          Deals Recientes
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-8 px-3 text-sm text-muted-foreground"
          onClick={() => onFolderChange('active-leads')}
        >
          <Users className="h-3.5 w-3.5 mr-3" />
          Leads Activos
        </Button>
      </div>
    </div>
  );
};