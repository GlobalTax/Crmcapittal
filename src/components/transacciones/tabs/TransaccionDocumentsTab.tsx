import React, { useState } from 'react';
import { Transaccion } from '@/types/Transaccion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Eye, MoreVertical, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTransaccionDocuments } from '@/hooks/useTransaccionDocuments';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
  uploaded_by: string;
  category: 'contract' | 'presentation' | 'financial' | 'legal' | 'other';
}

interface TransaccionDocumentsTabProps {
  transaccion: Transaccion;
}

const DOCUMENT_CATEGORIES = {
  contract: { label: 'Contrato', color: 'bg-blue-100 text-blue-600' },
  presentation: { label: 'Presentación', color: 'bg-green-100 text-green-600' },
  financial: { label: 'Financiero', color: 'bg-yellow-100 text-yellow-600' },
  legal: { label: 'Legal', color: 'bg-purple-100 text-purple-600' },
  other: { label: 'Otro', color: 'bg-gray-100 text-gray-600' }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const TransaccionDocumentsTab = ({ transaccion }: TransaccionDocumentsTabProps) => {
  const { documents, loading, uploadDocument, deleteDocument, downloadDocument, uploading } = useTransaccionDocuments(transaccion.id);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png';
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        for (const file of Array.from(files)) {
          await uploadDocument(file);
        }
      }
    };
    input.click();
  };

  const handleDownload = (document: Document) => {
    // Mock download - in real implementation, this would download the file
    console.log('Downloading:', document.name);
  };

  const handleView = (document: Document) => {
    // Mock view - in real implementation, this would open/preview the file
    console.log('Viewing:', document.name);
  };

  const handleDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Documentos</h3>
        <Button size="sm" variant="outline" onClick={handleFileUpload}>
          <Plus className="h-4 w-4 mr-1" />
          Subir Documento
        </Button>
      </div>

      {/* Documents List */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay documentos</p>
              <p className="text-xs">Sube documentos relacionados con esta transacción</p>
            </div>
          ) : (
            documents.map((document) => (
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
                        {document.name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${DOCUMENT_CATEGORIES[document.category].color}`}
                        >
                          {DOCUMENT_CATEGORIES[document.category].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(document.size)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        Subido {formatDistanceToNow(new Date(document.uploaded_at), { 
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
                        <DropdownMenuItem onClick={() => handleView(document)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(document)}>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(document.id)}
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
    </div>
  );
};