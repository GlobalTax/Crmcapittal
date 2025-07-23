
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Trash2, Shield, Lock } from 'lucide-react';
import { Valoracion, ValoracionDocument } from '@/types/Valoracion';
import { useValoracionPermissions } from '@/hooks/useValoracionPermissions';
import { useValoracionDocuments } from '@/hooks/useValoracionDocuments';
import { SecureButton } from './SecureButton';
import { DocumentReviewActions } from './DocumentReviewActions';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/hooks/useToast';
import { getDocumentIcon } from '@/utils/documentIcons';

interface ValoracionDocumentsListProps {
  valoracion: Valoracion;
  onRefresh?: () => void;
}

export const ValoracionDocumentsList = ({ valoracion, onRefresh }: ValoracionDocumentsListProps) => {
  const permissions = useValoracionPermissions(valoracion);
  const { 
    documents, 
    loading, 
    updateDocumentReviewStatus, 
    deleteDocument: deleteDoc 
  } = useValoracionDocuments(valoracion.id);

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

  const handleDocumentDelete = async (doc: ValoracionDocument) => {
    if (!permissions.canEdit) return;
    
    await deleteDoc(doc.id);
    onRefresh?.();
  };

  const handleStatusChange = async (documentId: string, status: any, notes?: string) => {
    await updateDocumentReviewStatus(documentId, status, notes);
    onRefresh?.();
  };

  const canDownload = (doc: ValoracionDocument) => {
    // Deliverable documents can always be downloaded if you can view the valoracion
    if (doc.document_type === 'deliverable') {
      // If document is approved, anyone with view permissions can download
      if (doc.review_status === 'approved') return permissions.canView;
      // Otherwise only editors can download
      return permissions.canEdit;
    }
    // Internal documents only if you can edit
    return permissions.canEdit;
  };

  const canDelete = (doc: ValoracionDocument) => {
    return permissions.canEdit && 
           valoracion.status !== 'delivered' && 
           doc.review_status !== 'approved';
  };

  const canReviewDocument = () => {
    return permissions.canEdit; // Only editors can review documents
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
              <Badge variant="default" className="bg-green-100 text-green-800 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Documentos Entregables
              </Badge>
            </div>
            <div className="space-y-3">
              {deliverableDocuments.map((doc) => {
                const DocumentIcon = getDocumentIcon(doc.content_type);
                return (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <DocumentIcon className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                          {format(new Date(doc.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Review Status */}
                      <DocumentReviewActions
                        document={doc}
                        onStatusChange={handleStatusChange}
                        canReview={canReviewDocument()}
                      />
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <SecureButton
                          hasPermission={canDownload(doc)}
                          disabledReason={
                            doc.review_status !== 'approved' && !permissions.canEdit 
                              ? "Documento pendiente de aprobación" 
                              : "Sin permisos para descargar"
                          }
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
                            disabledReason="No se puede eliminar documentos aprobados"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentDelete(doc)}
                            showLockIcon={false}
                          >
                            <Trash2 className="w-4 h-4" />
                          </SecureButton>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
              <Badge variant="secondary" className="text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Documentos Internos
              </Badge>
            </div>
            <div className="space-y-3">
              {internalDocuments.map((doc) => {
                const DocumentIcon = getDocumentIcon(doc.content_type);
                return (
                  <div 
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <DocumentIcon className="w-6 h-6 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(doc.file_size / 1024 / 1024).toFixed(2)} MB • 
                          {format(new Date(doc.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Review Status for Internal Documents */}
                      <DocumentReviewActions
                        document={doc}
                        onStatusChange={handleStatusChange}
                        canReview={canReviewDocument()}
                      />
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
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
                            onClick={() => handleDocumentDelete(doc)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
