import React from 'react';
import { ChevronRight, Home, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentFolders } from '@/hooks/useDocumentFolders';
import { DocumentFolder } from '@/types/DocumentFolder';

interface DocumentsBreadcrumbsProps {
  currentFolderId: string | null;
  onNavigateToFolder: (folderId: string | null) => void;
}

export const DocumentsBreadcrumbs: React.FC<DocumentsBreadcrumbsProps> = ({
  currentFolderId,
  onNavigateToFolder,
}) => {
  const { folders } = useDocumentFolders();

  const buildBreadcrumbPath = (folderId: string | null): DocumentFolder[] => {
    if (!folderId) return [];
    
    const path: DocumentFolder[] = [];
    let currentFolder = folders.find(f => f.id === folderId);
    
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = currentFolder.parent_folder_id 
        ? folders.find(f => f.id === currentFolder?.parent_folder_id)
        : undefined;
    }
    
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath(currentFolderId);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {/* Root */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 hover:bg-accent"
        onClick={() => onNavigateToFolder(null)}
      >
        <Home className="h-4 w-4" />
        <span className="ml-1">Documentos</span>
      </Button>

      {/* Breadcrumb items */}
      {breadcrumbPath.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 hover:bg-accent ${
              index === breadcrumbPath.length - 1 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground'
            }`}
            onClick={() => onNavigateToFolder(folder.id)}
          >
            <Folder className="h-4 w-4" />
            <span className="ml-1">{folder.name}</span>
          </Button>
        </React.Fragment>
      ))}
    </nav>
  );
};