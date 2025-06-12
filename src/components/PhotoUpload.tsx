
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PhotoUploadProps {
  onPhotoUploaded: (photoUrl: string) => void;
  currentPhotoUrl?: string;
  onPhotoRemoved?: () => void;
}

export const PhotoUpload = ({ onPhotoUploaded, currentPhotoUrl, onPhotoRemoved }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const uploadPhoto = async (file: File) => {
    try {
      setUploading(true);

      // Generar un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `operations/${fileName}`;

      // Subir el archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('operation-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obtener la URL pública del archivo
      const { data } = supabase.storage
        .from('operation-photos')
        .getPublicUrl(filePath);

      onPhotoUploaded(data.publicUrl);
    } catch (error) {
      console.error('Error subiendo foto:', error);
      alert('Error al subir la foto');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadPhoto(file);
    }
  };

  const removePhoto = () => {
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="photo">Foto de la Empresa</Label>
      
      {currentPhotoUrl ? (
        <div className="relative inline-block">
          <img 
            src={currentPhotoUrl} 
            alt="Foto de la empresa" 
            className="w-32 h-32 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removePhoto}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arrastra una imagen aquí o haz clic para seleccionar
          </p>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <Label htmlFor="photo">
            <Button 
              type="button" 
              variant="outline" 
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Subiendo...' : 'Seleccionar Foto'}
              </span>
            </Button>
          </Label>
        </div>
      )}
    </div>
  );
};
