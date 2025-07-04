import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/minimal/Button';
import { Badge } from '@/components/ui/minimal/Badge';

import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/Document';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const DocumentsList: React.FC = () => {
  const { documents, templates, loading, deleteDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || doc.document_type === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Documentos</h1>
          <p className="text-gray-600">Crea y gestiona documentos usando plantillas personalizables</p>
        </div>
        <div className="flex gap-2">
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
      </div>

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
          <div className="text-2xl font-bold">{documents.length}</div>
          <p className="text-xs text-gray-500">Total Documentos</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-2xl font-bold">
            {documents.filter(d => d.status === 'draft').length}
          </div>
          <p className="text-xs text-gray-500">Borradores</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-2xl font-bold">
            {documents.filter(d => d.status === 'published').length}
          </div>
          <p className="text-xs text-gray-500">Publicados</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="text-2xl font-bold">{templates.length}</div>
          <p className="text-xs text-gray-500">Plantillas</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((document) => (
          <div key={document.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
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
                </div>
                
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
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
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
  );
};