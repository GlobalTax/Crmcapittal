
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface TeaserActionsProps {
  selectedFile: File | null;
  isUploading: boolean;
  uploadError: string | null;
  isReplacingTeaser: boolean;
  onCancel: () => void;
  onUpload: () => void;
}

export const TeaserActions = ({
  selectedFile,
  isUploading,
  uploadError,
  isReplacingTeaser,
  onCancel,
  onUpload
}: TeaserActionsProps) => {
  return (
    <div className="flex justify-end space-x-3">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isUploading}
      >
        Cancelar
      </Button>
      <Button 
        onClick={onUpload}
        disabled={!selectedFile || isUploading || !!uploadError}
      >
        {isUploading ? (
          <>
            <Upload className="h-4 w-4 mr-2 animate-spin" />
            {isReplacingTeaser ? 'Cambiando...' : 'Subiendo...'}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {isReplacingTeaser ? 'Cambiar Teaser' : 'Subir Teaser'}
          </>
        )}
      </Button>
    </div>
  );
};
