
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, X } from 'lucide-react';
import { useManagers } from '@/hooks/useManagers';

interface ManagerPhotoUploadProps {
  managerId: string;
  managerName: string;
  currentPhoto?: string;
  onPhotoUpdated?: (photoUrl: string) => void;
}

export const ManagerPhotoUpload = ({ 
  managerId, 
  managerName, 
  currentPhoto, 
  onPhotoUpdated 
}: ManagerPhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { updateManagerPhoto } = useManagers();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB');
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      const result = await updateManagerPhoto(managerId, file);
      
      if (result.error) {
        alert('Error al subir la foto: ' + result.error);
        setPreviewUrl(null);
      } else if (result.data?.photo) {
        onPhotoUpdated?.(result.data.photo);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error al subir la foto');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const clearPreview = () => {
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        <Avatar className="h-20 w-20">
          <AvatarImage 
            src={previewUrl || currentPhoto} 
            alt={managerName}
          />
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
            {managerName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <Button
            size="sm"
            variant="primary"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={clearPreview}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={uploading}
          className="relative overflow-hidden"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Camera className="h-4 w-4 mr-2" />
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </Button>
      </div>
    </div>
  );
};
