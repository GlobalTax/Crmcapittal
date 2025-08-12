import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/minimal/Button';
import { Badge } from '@/components/ui/minimal/Badge';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';

import { useDocuments } from '@/hooks/useDocuments';
import { useDocumentFolders } from '@/hooks/useDocumentFolders';
import { Document } from '@/types/Document';
import { FolderTreeItem } from '@/types/DocumentFolder';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FolderTreeView } from './folders/FolderTreeView';
import { CreateFolderDialog } from './folders/CreateFolderDialog';
import { DocumentsBreadcrumbs } from './DocumentsBreadcrumbs';

export const DocumentsList: React.FC = () => {
  const { documents, templates, loading, deleteDocument } = useDocuments();
  const { moveDocumentToFolder } = useDocumentFolders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [createFolderParentId, setCreateFolderParentId] = useState<string>();
  const [editingFolder, setEditingFolder] = useState<FolderTreeItem | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesFolder = selectedFolderId === null || doc.folder_id === selectedFolderId;
    return matchesSearch && matchesType && matchesStatus && matchesFolder;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      draft: { label: 'Borrador', color: 'gray' as const },
      published: { label: 'Publicado', color: 'green' as const },
      archived: { label: 'Archivado', color: 'gray' as const },
    };
    
    const statusConfig = config[status as keyof typeof config] || config.draft;
    return <Badge color={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      contrato: 'bg-blue-100 text-blue-800',
      memorando: 'bg-green-100 text-green-800',
      informe: 'bg-purple-100 text-purple-800',
      propuesta: 'bg-orange-100 text-orange-800',
    } as const;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {type}
      </span>
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Eliminar el documento "${title}"? Esta acción no se puede deshacer.`)) {
      deleteDocument(id);
    }
  };

  const handleCreateFolder = (parentId?: string) => {
    setCreateFolderParentId(parentId);
    setEditingFolder(null);
    setShowCreateFolder(true);
  };

  const handleEditFolder = (folder: FolderTreeItem) => {
    setEditingFolder(folder);
    setShowCreateFolder(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    // Verificar si estamos arrastrando un documento sobre una carpeta
    const documentId = active.id as string;
    const targetFolderId = over.id as string;
    
    await moveDocumentToFolder(documentId, targetFolderId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with folders */}
        <div className="lg:col-span-1">
          <FolderTreeView
            onSelectFolder={setSelectedFolderId}
            selectedFolderId={selectedFolderId}
            onCreateFolder={handleCreateFolder}
            onEditFolder={handleEditFolder}
          />
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-end gap-2">
            <Link to="/documents/templates">
              <Button variant="secondary">
                Plantillas
              </Button>
            </Link>
            <Link to="/documents/new">
              <Button variant="primary">
                Nuevo Documento
              </Button>
            </Link>
          </div>

          {/* Breadcrumbs */}
          <DocumentsBreadcrumbs
            currentFolderId={selectedFolderId}
            onNavigateToFolder={setSelectedFolderId}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="general">General</option>
                <option value="contrato">Contrato</option>
                <option value="memorando">Memorando</option>
                <option value="informe">Informe</option>
                <option value="propuesta">Propuesta</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
                <option value="archived">Archivado</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-6">
              <div className="text-2xl font-bold">{filteredDocuments.length}</div>
              <p className="text-xs text-gray-500">Documentos en carpeta</p>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <div className="text-2xl font-bold">
                {filteredDocuments.filter(d => d.status === 'draft').length}
              </div>
              <p className="text-xs text-gray-500">Borradores</p>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <div className="text-2xl font-bold">
                {filteredDocuments.filter(d => d.status === 'published').length}
              </div>
              <p className="text-xs text-gray-500">Publicados</p>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-gray-500">Plantillas</p>
            </div>
          </div>

          {/* Documents List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredDocuments.map((document) => (
              <div 
                key={document.id} 
                className="bg-white rounded-lg border hover:shadow-md transition-shadow cursor-move"
                draggable
              >
                <div className="p-4 border-b">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold line-clamp-2">{document.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <Link to={`/documents/${document.id}`}>
                        <button className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1">
                          Editar
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDelete(document.id, document.title)}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getTypeBadge(document.document_type)}
                      {getStatusBadge(document.status)}
                      {document.current_version && document.current_version > 1 && (
                        <Badge color="blue">v{document.current_version}</Badge>
                      )}
                    </div>
                    
                    {document.tags && document.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {document.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {document.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{document.tags.length - 3} más</span>
                        )}
                      </div>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      <p>Creado: {format(new Date(document.created_at), 'dd/MM/yyyy', { locale: es })}</p>
                      <p>Actualizado: {format(new Date(document.updated_at), 'dd/MM/yyyy', { locale: es })}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="bg-white rounded-lg border">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' || selectedFolderId
                    ? 'No se encontraron documentos con los filtros aplicados'
                    : 'Aún no has creado ningún documento'}
                </p>
                <Link to="/documents/new">
                  <Button variant="primary">
                    Crear Primer Documento
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Folder Dialog */}
      <CreateFolderDialog
        open={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        parentFolderId={createFolderParentId}
        editingFolder={editingFolder}
      />
    </DndContext>
  );
};