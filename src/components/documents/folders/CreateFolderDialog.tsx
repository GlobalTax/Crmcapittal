import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentFolders } from '@/hooks/useDocumentFolders';
import { DocumentFolder, FolderTreeItem } from '@/types/DocumentFolder';

interface CreateFolderDialogProps {
  open: boolean;
  onClose: () => void;
  parentFolderId?: string;
  editingFolder?: FolderTreeItem | null;
}

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({
  open,
  onClose,
  parentFolderId,
  editingFolder,
}) => {
  const { createFolder, updateFolder, folders, buildFolderTree } = useDocumentFolders();
  const [formData, setFormData] = useState({
    name: '',
    folder_type: 'general' as DocumentFolder['folder_type'],
    parent_folder_id: parentFolderId || null,
  });
  const [saving, setSaving] = useState(false);

  const folderTree = buildFolderTree();

  // Función recursiva para aplanar el árbol de carpetas
  const flattenFolders = (folders: FolderTreeItem[]): FolderTreeItem[] => {
    const flattened: FolderTreeItem[] = [];
    folders.forEach(folder => {
      flattened.push(folder);
      if (folder.children.length > 0) {
        flattened.push(...flattenFolders(folder.children));
      }
    });
    return flattened;
  };

  const availableParentFolders = flattenFolders(folderTree);

  useEffect(() => {
    if (editingFolder) {
      setFormData({
        name: editingFolder.name,
        folder_type: editingFolder.folder_type,
        parent_folder_id: editingFolder.parent_folder_id,
      });
    } else {
      setFormData({
        name: '',
        folder_type: 'general',
        parent_folder_id: parentFolderId || null,
      });
    }
  }, [editingFolder, parentFolderId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, formData);
      } else {
        await createFolder(formData);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const getFolderTypeDescription = (type: string) => {
    switch (type) {
      case 'client':
        return 'Carpeta vinculada a un cliente específico';
      case 'project':
        return 'Carpeta para documentos de un proyecto';
      case 'template':
        return 'Carpeta para plantillas de documentos';
      default:
        return 'Carpeta general para documentos';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingFolder ? 'Editar Carpeta' : 'Nueva Carpeta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la carpeta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ingresa el nombre de la carpeta"
              required
            />
          </div>

          <div>
            <Label htmlFor="parent">Carpeta padre</Label>
            <Select
              value={formData.parent_folder_id || 'root'}
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  parent_folder_id: value === 'root' ? null : value 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Carpeta raíz</SelectItem>
                {availableParentFolders
                  .filter(folder => editingFolder ? folder.id !== editingFolder.id : true)
                  .map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {'  '.repeat(folder.depth)}{folder.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="type">Tipo de carpeta</Label>
            <Select
              value={formData.folder_type}
              onValueChange={(value) => 
                setFormData(prev => ({ 
                  ...prev, 
                  folder_type: value as DocumentFolder['folder_type']
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="project">Proyecto</SelectItem>
                <SelectItem value="template">Plantilla</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {getFolderTypeDescription(formData.folder_type)}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !formData.name.trim()}>
              {saving ? 'Guardando...' : editingFolder ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};