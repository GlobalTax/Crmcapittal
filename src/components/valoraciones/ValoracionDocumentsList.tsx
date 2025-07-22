
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Eye, Trash2, Upload } from 'lucide-react';
import { Valoracion } from '@/types/Valoracion';
import { useValoracionPermissions } from '@/hooks/useValoracionPermissions';
import { SecureButton } from './SecureButton';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/useToast';

interface ValoracionDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  document_type: 'deliverable' | 'internal';
  created_at: string;
  uploaded_by: string;
}

interface ValoracionDocumentsListProps {
  valoracion: Valoracion;
  onRefresh?: () => void;
}

export const ValoracionDocumentsList = ({ valoracion, onRefresh }: ValoracionDocumentsListProps) => {
  const [documents, setDocuments] = useState<ValoracionDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const permissions = useValoracionPermissions(valoracion);

  useEffect(() => {
    fetchDocuments();
  }, [valoracion.id]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('valoracion_documents')
        .select('*')
        .eq('valoracion_id', valoracion.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error al cargar documentos',
        description: 'No se pudieron cargar los documentos de la valoración',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (document: ValoracionDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('valoracion-documents')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Log de seguridad para descarga
      await supabase.from('valoracion_security_logs').insert({
        valoracion_id: valoracion.id,
        action: 'document_download',
        details: {
          document_id: document.id,
          document_name: document.file_name,
          document_type: document.document_type
        },
        user_id: (await supabase.auth.getUser()).data.user?.id
      });

    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error al descargar',
        description: 'No se pudo descargar el documento',
        variant: 'destructive'
      });
    }
  };

  const deleteDocument = async (document: ValoracionDocument) => {
    if (!permissions.canEdit) return;

    try {
      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('valoracion-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('valoracion_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast({
        title: 'Documento eliminado',
        description: 'El documento se eliminó correctamente'
      });

      fetchDocuments();
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar el documento',
        variant: 'destructive'
      });
    }
  };

  const getDocumentIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const canDownload = (document: ValoracionDocument) => {
    // Los documentos entregables siempre se pueden descargar si se puede ver la valoración
    if (document.document_type === 'deliverable') return permissions.canView;
    // Los documentos internos solo si se puede editar
    return permissions.canEdit;
  };

  const canDelete = (document: ValoracionDocument) => {
    return permissions.canEdit && valoracion.status !== 'delivered';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const deliverableDocuments = documents.filter(doc => doc.document_type === 'deliverable');
  const internalDocuments = documents.filter(doc => doc.document_type === 'internal');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Documentos entregables */}
        {deliverableDocuments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="default" className="bg-green-100 text-green-800">
                📤 Documentos Entregables
              </Badge>
            </div>
            <div className="space-y-2">
              {deliverableDocuments.map((document) => (
                <div 
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getDocumentIcon(document.content_type)}</span>
                    <div>
                      <p className="font-medium">{document.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB • 
                        {format(new Date(document.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SecureButton
                      hasPermission={canDownload(document)}
                      disabledReason="Sin permisos para descargar este documento"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(document)}
                      showLockIcon={false}
                    >
                      <Download className="w-4 h-4" />
                    </SecureButton>
                    
                    {canDelete(document) && (
                      <SecureButton
                        hasPermission={canDelete(document)}
                        disabledReason="No se puede eliminar este documento"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(document)}
                        showLockIcon={false}
                      >
                        <Trash2 className="w-4 h-4" />
                      </SecureButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Separador si hay ambos tipos */}
        {deliverableDocuments.length > 0 && internalDocuments.length > 0 && permissions.canEdit && (
          <Separator />
        )}

        {/* Documentos internos - solo visibles para editores */}
        {internalDocuments.length > 0 && permissions.canEdit && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-muted-foreground">
                🔒 Documentos Internos
              </Badge>
            </div>
            <div className="space-y-2">
              {internalDocuments.map((document) => (
                <div 
                  key={document.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getDocumentIcon(document.content_type)}</span>
                    <div>
                      <p className="font-medium">{document.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(document.file_size / 1024 / 1024).toFixed(2)} MB • 
                        {format(new Date(document.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(document)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    {canDelete(document) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(document)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay documentos disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
