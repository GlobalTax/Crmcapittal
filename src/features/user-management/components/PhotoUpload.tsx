/**
 * Photo Upload Component
 * 
 * Reusable component for photo upload with validation
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, X } from 'lucide-react';

interface PhotoUploadProps {
  selectedPhoto: File | null;
  onPhotoSelect: (file: File | null) => void;
  onClearPhoto: () => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  selectedPhoto,
  onPhotoSelect,
  onClearPhoto
}) => {
  const { toast } = useToast();

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    onPhotoSelect(file);
  };

  return (
    <div className="space-y-2">
      <Label>Foto del Gestor</Label>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoSelect}
          className="hidden"
          id="photo-upload"
        />
        <Label htmlFor="photo-upload" className="cursor-pointer">
          <Button type="button" variant="outline" size="sm" asChild>
            <span>
              <Camera className="h-4 w-4 mr-2" />
              {selectedPhoto ? 'Cambiar foto' : 'Seleccionar foto'}
            </span>
          </Button>
        </Label>
        
        {selectedPhoto && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedPhoto.name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearPhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {selectedPhoto && (
        <div className="mt-2">
          <img
            src={URL.createObjectURL(selectedPhoto)}
            alt="Preview"
            className="w-16 h-16 object-cover rounded-md"
          />
        </div>
      )}
    </div>
  );
};