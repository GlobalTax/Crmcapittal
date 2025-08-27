import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useDocumentFolders } from '@/hooks/useDocumentFolders';
import { FolderTreeItem } from '@/types/DocumentFolder';
import { logger } from '@/utils/productionLogger';

interface FolderNodeProps {
  folder: FolderTreeItem;
  isExpanded: boolean;
  onToggle: (folderId: string) => void;
  onCreateChild: (parentId: string) => void;
  onEdit: (folder: FolderTreeItem) => void;
  onDelete: (folderId: string) => void;
  onSelect: (folderId: string | null) => void;
  selectedId: string | null;
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  isExpanded,
  onToggle,
  onCreateChild,
  onEdit,
  onDelete,
  onSelect,
  selectedId,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedId === folder.id;

  const getFolderIcon = () => {
    if (hasChildren && isExpanded) return <FolderOpen className="h-4 w-4 text-primary" />;
    return <Folder className="h-4 w-4 text-muted-foreground" />;
  };

  const getFolderTypeColor = () => {
    switch (folder.folder_type) {
      case 'client': return 'text-blue-600';
      case 'project': return 'text-green-600';
      case 'template': return 'text-purple-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer group ${
          isSelected ? 'bg-accent border-l-2 border-primary' : ''
        }`}
        style={{ paddingLeft: `${folder.depth * 16 + 12}px` }}
        onClick={() => onSelect(folder.id)}
      >
        {/* Expand/Collapse button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-4 w-4"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(folder.id);
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}

        {/* Folder icon */}
        <div {...listeners} className="cursor-move">
          {getFolderIcon()}
        </div>

        {/* Folder name */}
        <span className={`flex-1 text-sm font-medium ${getFolderTypeColor()}`}>
          {folder.name}
        </span>

        {/* Actions menu */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateChild(folder.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva subcarpeta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(folder)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(folder.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {folder.children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onCreateChild={onCreateChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface FolderTreeViewProps {
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
  onCreateFolder: (parentId?: string) => void;
  onEditFolder: (folder: FolderTreeItem) => void;
}

export const FolderTreeView: React.FC<FolderTreeViewProps> = ({
  onSelectFolder,
  selectedFolderId,
  onCreateFolder,
  onEditFolder,
}) => {
  const { folders, deleteFolder, buildFolderTree } = useDocumentFolders();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const folderTree = buildFolderTree();

  const handleToggle = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleDelete = async (folderId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta carpeta? Esta acción no se puede deshacer.')) {
      await deleteFolder(folderId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Aquí implementarías la lógica para mover carpetas
    logger.debug('Move folder requested', { fromFolderId: active.id, toFolderId: over.id });
  };

  return (
    <div className="p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Carpetas</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateFolder()}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva carpeta
        </Button>
      </div>

      {/* Root folder option */}
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors cursor-pointer mb-2 ${
          selectedFolderId === null ? 'bg-accent border-l-2 border-primary' : ''
        }`}
        onClick={() => onSelectFolder(null)}
      >
        <Folder className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Todos los documentos</span>
      </div>

      {/* Folder tree */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={folders.map(f => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {folderTree.map((folder) => (
              <FolderNode
                key={folder.id}
                folder={folder}
                isExpanded={expandedFolders.has(folder.id)}
                onToggle={handleToggle}
                onCreateChild={(parentId) => onCreateFolder(parentId)}
                onEdit={onEditFolder}
                onDelete={handleDelete}
                onSelect={onSelectFolder}
                selectedId={selectedFolderId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};