
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lead } from '@/types/Lead';
import { useLeadFiles } from '@/hooks/useLeadFiles';
import { StrictFileUploader } from '@/components/StrictFileUploader';
import { Download, Trash2, FileText, Image, File } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { logger } from '@/utils/productionLogger';

interface LeadFilesTabProps {
  lead: Lead;
}

export const LeadFilesTab = ({ lead }: LeadFilesTabProps) => {
  const { files, isLoading, uploadFile, deleteFile, isUploading } = useLeadFiles(lead.id);

  const handleValidFiles = useCallback((validFiles: File[]) => {
    validFiles.forEach((file) => {
      uploadFile({ file, leadId: lead.id });
    });
  }, [uploadFile, lead.id]);

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Tamaño desconocido';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string | null) => {
    if (!contentType) return <File className="h-8 w-8" />;
    
    if (contentType.startsWith('image/')) {
      return <Image className="h-8 w-8" />;
    } else if (contentType.includes('pdf')) {
      return <FileText className="h-8 w-8" />;
    } else {
      return <File className="h-8 w-8" />;
    }
  };

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Failed to download lead file', { error, fileName, leadId: lead.id });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Archivos del Lead</CardTitle>
        </CardHeader>
        <CardContent>
          <StrictFileUploader
            onFilesValid={handleValidFiles}
            multiple={true}
            disabled={isUploading}
          />
          {isUploading && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <p className="text-sm text-primary">Subiendo archivo...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files List */}
      <div className="space-y-4">
        {files.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay archivos para este lead. Sube el primer archivo.
              </p>
            </CardContent>
          </Card>
        ) : (
          files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-muted-foreground">
                    {getFileIcon(file.content_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{file.file_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>
                            Subido {formatDistanceToNow(new Date(file.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file.file_url, file.file_name)}
                          className="h-8 w-8 p-0"
                          title="Descargar"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteFile(file.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {file.content_type?.startsWith('image/') && (
                      <div className="mt-2">
                        <img
                          src={file.file_url}
                          alt={file.file_name}
                          className="max-w-xs max-h-32 object-cover rounded border"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
