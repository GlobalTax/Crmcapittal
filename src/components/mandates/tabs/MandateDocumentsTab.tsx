import React, { useState } from 'react';
import { BuyingMandate } from '@/types/BuyingMandate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Upload, Search, FileText, Download, Eye, MoreVertical, Lock, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MandateDocumentsTabProps {
  mandate: BuyingMandate;
}

export const MandateDocumentsTab = ({ mandate }: MandateDocumentsTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'confidential' | 'public'>('all');

  // Mock documents data
  const mockDocuments = [
    {
      id: '1',
      document_name: 'Brief del Mandato de Compra',
      document_type: 'general' as const,
      file_size: 2048000,
      content_type: 'application/pdf',
      uploaded_by: 'María López',
      uploaded_at: '2024-01-15T10:30:00Z',
      is_confidential: false,
      notes: 'Documento inicial con criterios de búsqueda'
    },
    {
      id: '2',
      document_name: 'NDA Template',
      document_type: 'nda' as const,
      file_size: 512000,
      content_type: 'application/pdf',
      uploaded_by: 'Juan García',
      uploaded_at: '2024-01-16T14:20:00Z',
      is_confidential: true,
      notes: 'Plantilla de acuerdo de confidencialidad'
    },
    {
      id: '3',
      document_name: 'Análisis Sectorial - Tecnología',
      document_type: 'info_sheet' as const,
      file_size: 4096000,
      content_type: 'application/pdf',
      uploaded_by: 'Ana Martín',
      uploaded_at: '2024-01-18T09:15:00Z',
      is_confidential: false,
      notes: 'Análisis del sector tecnológico y oportunidades'
    },
    {
      id: '4',
      document_name: 'Presentación Empresas Objetivo',
      document_type: 'presentation' as const,
      file_size: 8192000,
      content_type: 'application/vnd.ms-powerpoint',
      uploaded_by: 'Carlos Ruiz',
      uploaded_at: '2024-01-20T16:45:00Z',
      is_confidential: true,
      notes: 'Presentación confidencial con empresas identificadas'
    }
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'nda': 'NDA',
      'loi': 'LOI',
      'info_sheet': 'Ficha Informativa',
      'presentation': 'Presentación',
      'general': 'General',
      'other': 'Otro'
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'nda': 'bg-purple-100 text-purple-600',
      'loi': 'bg-green-100 text-green-600',
      'info_sheet': 'bg-blue-100 text-blue-600',
      'presentation': 'bg-orange-100 text-orange-600',
      'general': 'bg-gray-100 text-gray-600',
      'other': 'bg-gray-100 text-gray-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📊';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📈';
    return '📄';
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'confidential') matchesFilter = doc.is_confidential;
    if (filter === 'public') matchesFilter = !doc.is_confidential;
    
    return matchesSearch && matchesFilter;
  });

  const documentCounts = {
    all: mockDocuments.length,
    confidential: mockDocuments.filter(d => d.is_confidential).length,
    public: mockDocuments.filter(d => !d.is_confidential).length
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Documentos del Mandato</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona todos los documentos relacionados con el mandato
          </p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todos ({documentCounts.all})
          </Button>
          <Button 
            variant={filter === 'public' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('public')}
          >
            <Users className="h-3 w-3 mr-1" />
            Públicos ({documentCounts.public})
          </Button>
          <Button 
            variant={filter === 'confidential' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilter('confidential')}
          >
            <Lock className="h-3 w-3 mr-1" />
            Confidenciales ({documentCounts.confidential})
          </Button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl">
                    {getFileIcon(document.content_type)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-sm line-clamp-2">
                      {document.document_name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-xs ${getDocumentTypeColor(document.document_type)}`}>
                        {getDocumentTypeLabel(document.document_type)}
                      </Badge>
                      {document.is_confidential && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* File Info */}
              <div className="text-xs text-muted-foreground">
                <div>Tamaño: {formatFileSize(document.file_size)}</div>
                <div>Tipo: {document.content_type.split('/')[1]?.toUpperCase()}</div>
              </div>

              {/* Upload Info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(document.uploaded_at), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                Subido por <span className="font-medium">{document.uploaded_by}</span>
              </div>

              {/* Notes */}
              {document.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {document.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Descargar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm 
              ? "No se encontraron documentos con esos criterios" 
              : "Sube documentos para mantener toda la información organizada"
            }
          </p>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Subir Primer Documento
          </Button>
        </div>
      )}
    </div>
  );
};