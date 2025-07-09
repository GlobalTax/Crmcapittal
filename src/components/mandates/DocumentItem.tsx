import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Trash2, 
  FileText, 
  FileImage, 
  File, 
  FileSpreadsheet,
  FileCode2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { MandateDocument } from '@/types/MandateDocument';
import { DOCUMENT_TYPE_LABELS } from '@/types/MandateDocument';

interface DocumentItemProps {
  document: MandateDocument;
  onDownload: (document: MandateDocument) => void;
  onDelete: (documentId: string) => void;
  canDelete?: boolean;
}

const getFileIcon = (contentType?: string) => {
  if (!contentType) return File;
  
  if (contentType.startsWith('image/')) return FileImage;
  if (contentType === 'application/pdf') return FileText;
  if (contentType.includes('spreadsheet') || contentType.includes('excel')) return FileSpreadsheet;
  if (contentType.includes('text/') || contentType.includes('document')) return FileText;
  if (contentType.includes('application/json') || contentType.includes('javascript')) return FileCode2;
  
  return File;
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Tamaño desconocido';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const getTypeVariant = (documentType: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (documentType) {
    case 'contract': return 'default';
    case 'financial': return 'secondary';
    case 'legal': return 'outline';
    case 'presentation': return 'destructive';
    default: return 'outline';
  }
};

export const DocumentItem = ({ 
  document, 
  onDownload, 
  onDelete, 
  canDelete = true 
}: DocumentItemProps) => {
  const FileIcon = getFileIcon(document.content_type);
  
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium truncate">{document.document_name}</p>
            <Badge variant={getTypeVariant(document.document_type)} className="text-xs">
              {DOCUMENT_TYPE_LABELS[document.document_type as keyof typeof DOCUMENT_TYPE_LABELS] || document.document_type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatFileSize(document.file_size)}</span>
            <span>
              {document.created_at && format(new Date(document.created_at), 'dd MMM yyyy', { locale: es })}
            </span>
          </div>
          
          {document.notes && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{document.notes}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 ml-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDownload(document)}
          className="h-8 w-8 p-0"
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Descargar</span>
        </Button>
        
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(document.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        )}
      </div>
    </div>
  );
};