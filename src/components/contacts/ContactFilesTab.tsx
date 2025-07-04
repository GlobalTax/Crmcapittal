import { useRef, useState } from 'react';
import { useContactFiles, ContactFile } from '@/hooks/useContactFiles';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Trash2
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
    return <Mail className="h-5 w-5 text-muted-foreground" />;
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
    <div className="space-y-8">
      {/* Sección de subida */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Archivo</h3>
        <div className="flex items-center gap-4">
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
            variant="outline"
          >
            {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
          </Button>
          <span className="text-sm text-gray-500">
            Tamaño máximo: 10MB
          </span>
        </div>
      </div>

      {/* Lista de archivos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Archivos</h3>
          <span className="text-sm text-gray-500">({files.length})</span>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No hay archivos para este contacto.</p>
            <p className="text-sm mt-1">Sube archivos usando el botón de arriba.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {getFileIcon(file.file_name)}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </span>
                      {file.file_size && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatFileSize(file.file_size)}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(file.created_at).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(file)}
                    title="Descargar"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(file)}
                    title="Eliminar"
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}