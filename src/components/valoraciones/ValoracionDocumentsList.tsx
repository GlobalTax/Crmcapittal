
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Trash2 } from 'lucide-react';
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
      // Using any type to avoid TypeScript issues
      const { data, error } = await (supabase as any)
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

  const downloadDocument = async (doc: ValoracionDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('valoracion-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const linkElement = window.document.createElement('a');
      linkElement.href = url;
      linkElement.download = doc.file_name;
      window.document.body.appendChild(linkElement);
      linkElement.click();
      window.document.body.removeChild(linkElement);
      URL.revokeObjectURL(url);

      // Security log for download using any to avoid TypeScript issues
      await (supabase as any).from('valoracion_security_logs').insert({
        valoracion_id: valoracion.id,
        action: 'document_download',
        details: {
          document_id: doc.id,
          document_name: doc.file_name,
          document_type: doc.document_type
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

  const deleteDocument = async (doc: ValoracionDocument) => {
    if (!permissions.canEdit) return;

    try {
      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from('valoracion-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete record from database using any to avoid TypeScript issues
      const { error: dbError } = await (supabase as any)
        .from('valoracion_documents')
        .delete()
        .eq('id', doc.id);

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

  const canDownload = (doc: ValoracionDocument) => {
    // Deliverable documents can always be downloaded if you can view the valoracion
    if (doc.document_type === 'deliverable') return permissions.canView;
    // Internal documents only if you can edit
    return permissions.canEdit;
  };

  const canDelete = (doc: ValoracionDocument) => {
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
        {/* Deliverable documents */}
        {deliverableDocuments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="default" className="bg-green-100 text-green-800">
                📤 Documentos Entregables
              </Badge>
            </div>
            <div className="space-y-2">
              {deliverableDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getDocumentIcon(doc.content_type)}</span>
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                        {format(new Date(doc.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SecureButton
                      hasPermission={canDownload(doc)}
                      disabledReason="Sin permisos para descargar este documento"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                      showLockIcon={false}
                    >
                      <Download className="w-4 h-4" />
                    </SecureButton>
                    
                    {canDelete(doc) && (
                      <SecureButton
                        hasPermission={canDelete(doc)}
                        disabledReason="No se puede eliminar este documento"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(doc)}
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

        {/* Separator if both types exist */}
        {deliverableDocuments.length > 0 && internalDocuments.length > 0 && permissions.canEdit && (
          <Separator />
        )}

        {/* Internal documents - only visible to editors */}
        {internalDocuments.length > 0 && permissions.canEdit && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className="text-muted-foreground">
                🔒 Documentos Internos
              </Badge>
            </div>
            <div className="space-y-2">
              {internalDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getDocumentIcon(doc.content_type)}</span>
                    <div>
                      <p className="font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                        {format(new Date(doc.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadDocument(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    {canDelete(doc) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(doc)}
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
