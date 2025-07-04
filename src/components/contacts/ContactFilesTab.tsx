import { useRef, useState } from 'react';
import { useContactFiles, ContactFile } from '@/hooks/useContactFiles';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  File, 
  Trash2, 
  Download,
  FileText,
  Image,
  Archive
} from 'lucide-react';

interface Props {
  contactId: string;
  currentUserId: string;
}

export default function ContactFilesTab({ contactId, currentUserId }: Props) {
  const { files, loading, addFile, deleteFile } = useContactFiles(contactId);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return <Archive className="h-5 w-5 text-yellow-500" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Validación de tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "El archivo no puede exceder 10MB",
          variant: "destructive",
        });
        return;
      }

      // Subir al storage
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${currentUserId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('contact-files')
        .upload(filePath, file);
      
      if (error) throw error;
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('contact-files')
        .getPublicUrl(filePath);
      
      // Guardar en la base de datos
      await addFile({
        contact_id: contactId,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
        uploaded_by: currentUserId,
      });
      
      toast({
        title: "Archivo subido",
        description: `"${file.name}" se ha subido correctamente.`,
      });
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast({
        title: "Error al subir archivo",
        description: "No se pudo subir el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleDelete = async (file: ContactFile) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${file.file_name}"?`)) {
      return;
    }

    try {
      await deleteFile(file.id);
      toast({
        title: "Archivo eliminado",
        description: `"${file.file_name}" ha sido eliminado.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (file: ContactFile) => {
    const link = document.createElement('a');
    link.href = file.file_url;
    link.download = file.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando archivos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Botón de subida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Archivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            ref={fileInput}
            className="hidden"
            onChange={handleUpload}
            accept="*/*"
          />
          <Button
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
          </Button>
          
          <p className="text-xs text-muted-foreground mt-2">
            Tamaño máximo: 10MB. Todos los tipos de archivo son compatibles.
          </p>
        </CardContent>
      </Card>

      {/* Lista de archivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <File className="h-5 w-5" />
            Archivos ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <File className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay archivos para este contacto.</p>
              <p className="text-xs mt-1">Sube archivos usando el botón de arriba.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {getFileIcon(file.file_name)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {file.file_name}
                      </span>
                      {file.file_size && (
                        <span className="text-xs text-muted-foreground">
                          ({formatFileSize(file.file_size)})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Subido el {new Date(file.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(file)}
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(file)}
                      title="Eliminar"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}