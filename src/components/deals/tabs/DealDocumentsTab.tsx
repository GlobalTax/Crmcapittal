import React, { useState } from 'react';
import { Deal } from '@/types/Deal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Download, Eye, MoreVertical, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDealDocuments } from '@/hooks/useDealDocuments';
import { DealDocumentUploader } from '../DealDocumentUploader';
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUSES, DocumentCategory } from '@/types/DealDocument';

interface DealDocumentsTabProps {
  deal: Deal;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DealDocumentsTab = ({ deal }: DealDocumentsTabProps) => {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    updateDocumentStatus,
    deleteDocument,
    downloadDocument,
    getDocumentsByCategory,
    getDocumentCounts
  } = useDealDocuments(deal.id);

  const documentCounts = getDocumentCounts();
  const filteredDocuments = selectedCategory === 'all' 
    ? documents 
    : getDocumentsByCategory(selectedCategory);

  const handleUpload = async (file: File, data: any) => {
    await uploadDocument(file, data);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Header with category filters */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium mb-2">Documentos</h3>
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as DocumentCategory | 'all')}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 w-full">
              <TabsTrigger value="all" className="text-xs">
                Todos ({documents.length})
              </TabsTrigger>
              {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label, icon }]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  {icon} {label} ({documentCounts[key] || 0})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Subir
        </Button>
      </div>

      {/* Documents List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Cargando documentos...</p>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos</p>
              <p className="text-xs">
                {selectedCategory === 'all' 
                  ? 'Sube documentos relacionados con esta oportunidad'
                  : `No hay documentos de tipo ${DOCUMENT_CATEGORIES[selectedCategory as DocumentCategory]?.label}`
                }
              </p>
            </div>
          ) : (
            filteredDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-neutral-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {document.file_name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${DOCUMENT_CATEGORIES[document.document_category].color}`}
                        >
                          {DOCUMENT_CATEGORIES[document.document_category].icon} {DOCUMENT_CATEGORIES[document.document_category].label}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${DOCUMENT_STATUSES[document.document_status].color}`}
                        >
                          {DOCUMENT_STATUSES[document.document_status].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(document.file_size)}
                        </span>
                      </div>
                      
                      {document.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          {document.notes}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        Subido {formatDistanceToNow(new Date(document.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => downloadDocument(document)}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateDocumentStatus(document.id, 'sent')}>
                          <Upload className="h-4 w-4 mr-2" />
                          Marcar como Enviado
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateDocumentStatus(document.id, 'signed')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Marcar como Firmado
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteDocument(document.id)}
                          className="text-destructive"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subir Documento</DialogTitle>
          </DialogHeader>
          <DealDocumentUploader
            onUpload={handleUpload}
            uploading={uploading}
            onClose={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};