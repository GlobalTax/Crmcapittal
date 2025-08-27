import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Shield, Calendar } from 'lucide-react';
import { MandateDocument } from '@/types/BuyingMandate';
import { logger } from '@/utils/productionLogger';

interface ClientDocumentDownloadsProps {
  documents: MandateDocument[];
}

export const ClientDocumentDownloads = ({ documents }: ClientDocumentDownloadsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getDocumentTypeInfo = (type: MandateDocument['document_type']) => {
    const typeConfig = {
      nda: { label: 'NDA', variant: 'default' as const, description: 'Acuerdo de Confidencialidad' },
      loi: { label: 'LOI', variant: 'secondary' as const, description: 'Carta de Intención' },
      info_sheet: { label: 'Info Sheet', variant: 'outline' as const, description: 'Ficha Informativa' },
      presentation: { label: 'Presentación', variant: 'outline' as const, description: 'Material de Presentación' },
      general: { label: 'General', variant: 'outline' as const, description: 'Documento General' },
      other: { label: 'Otro', variant: 'outline' as const, description: 'Otro Documento' },
    };
    return typeConfig[type] || typeConfig.general;
  };

  const handleDownload = async (doc: MandateDocument) => {
    try {
      // Create a temporary link to download the file
      const link = window.document.createElement('a');
      link.href = doc.file_url;
      link.download = doc.document_name;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      logger.error('Failed to download document file', { error, documentName: doc.document_name });
    }
  };

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documentos Disponibles</span>
          </CardTitle>
          <CardDescription>
            Documentos autorizados para descarga
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay documentos disponibles para descarga en este momento
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Documentos Disponibles ({documents.length})</span>
        </CardTitle>
        <CardDescription>
          Documentos autorizados que puede descargar relacionados con el mandato
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.map((document) => {
            const typeInfo = getDocumentTypeInfo(document.document_type);
            
            return (
              <div
                key={document.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">{document.document_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {typeInfo.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <Badge variant={typeInfo.variant} className="text-xs">
                        {typeInfo.label}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Subido: {formatDate(document.uploaded_at)}</span>
                      </div>
                      {document.file_size && (
                        <div className="flex items-center space-x-1">
                          <Shield className="h-3 w-3" />
                          <span>{formatFileSize(document.file_size)}</span>
                        </div>
                      )}
                    </div>

                    {document.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        {document.notes}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="ml-4"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium">Información importante:</p>
              <p>Todos los documentos proporcionados son confidenciales y solo deben ser utilizados para los fines acordados en este mandato.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};