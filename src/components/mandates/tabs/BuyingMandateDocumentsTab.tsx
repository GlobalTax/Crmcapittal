import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Upload, Plus } from 'lucide-react';
import { BuyingMandate, MandateDocument } from '@/types/BuyingMandate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BuyingMandateDocumentsTabProps {
  mandate: BuyingMandate;
  documents: MandateDocument[];
  onDocumentUpdate: () => void;
}

export const BuyingMandateDocumentsTab = ({
  mandate,
  documents,
  onDocumentUpdate
}: BuyingMandateDocumentsTabProps) => {
  const getDocumentTypeLabel = (type: string) => {
    const typeMap = {
      nda: 'NDA',
      loi: 'LOI',
      info_sheet: 'Ficha Informativa',
      presentation: 'Presentación',
      general: 'General',
      other: 'Otro'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getDocumentTypeVariant = (type: string) => {
    const variantMap = {
      nda: 'destructive' as const,
      loi: 'default' as const,
      info_sheet: 'secondary' as const,
      presentation: 'default' as const,
      general: 'outline' as const,
      other: 'secondary' as const
    };
    return variantMap[type as keyof typeof variantMap] || 'outline' as const;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Documentos del Mandato</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona todos los documentos relacionados con {mandate.mandate_name}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <div className="space-y-4">
          {documents.map((document) => (
            <Card key={document.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm truncate">
                          {document.document_name}
                        </h4>
                        <Badge variant={getDocumentTypeVariant(document.document_type)} className="text-xs">
                          {getDocumentTypeLabel(document.document_type)}
                        </Badge>
                        {document.is_confidential && (
                          <Badge variant="destructive" className="text-xs">
                            Confidencial
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-xs text-muted-foreground">
                          Subido: {format(new Date(document.uploaded_at), 'dd MMM yyyy', { locale: es })}
                        </p>
                        {document.file_size && (
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(document.file_size)}
                          </p>
                        )}
                        {document.content_type && (
                          <p className="text-xs text-muted-foreground">
                            {document.content_type}
                          </p>
                        )}
                      </div>
                      {document.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {document.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Aún no se han subido documentos para este mandato.
            </p>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Subir Primer Documento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};