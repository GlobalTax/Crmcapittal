
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Operation } from "@/types/Operation";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeaserUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  operation: Operation | null;
  onUploadComplete: (operationId: string, teaserUrl: string) => void;
}

export const TeaserUploadDialog = ({ 
  open, 
  onOpenChange, 
  operation,
  onUploadComplete 
}: TeaserUploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { uploadTeaser, isUploading, deleteTeaser } = useSupabaseStorage();

  const isReplacingTeaser = operation?.teaser_url;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (file) {
      console.log('Archivo seleccionado:', file.name, file.type, file.size);
      
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Solo se permiten archivos PDF, DOC y DOCX');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('El archivo no puede exceder 10MB');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !operation) {
      console.error('No hay archivo seleccionado o operación');
      return;
    }

    console.log('Iniciando subida para operación:', operation.id);
    setUploadError(null);

    // Si estamos reemplazando un teaser, eliminar el anterior primero
    if (isReplacingTeaser && operation.teaser_url) {
      console.log('Eliminando teaser anterior:', operation.teaser_url);
      await deleteTeaser(operation.teaser_url);
    }

    const teaserUrl = await uploadTeaser(selectedFile, operation.id);
    
    if (teaserUrl) {
      console.log('Subida exitosa, URL:', teaserUrl);
      onUploadComplete(operation.id, teaserUrl);
      setSelectedFile(null);
      setUploadError(null);
      onOpenChange(false);
    } else {
      setUploadError('Error al subir el archivo. Inténtalo de nuevo.');
    }
  };

  const resetDialog = () => {
    setSelectedFile(null);
    setUploadError(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isReplacingTeaser ? 'Cambiar Teaser' : 'Subir Teaser'}
          </DialogTitle>
        </DialogHeader>

        {operation && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">{operation.company_name}</p>
              <p className="text-sm text-gray-600">{operation.sector}</p>
              {operation.teaser_url && (
                <div className="mt-2 flex items-center space-x-1 text-green-600 text-sm">
                  <CheckCircle className="h-3 w-3" />
                  <span>Teaser actual disponible</span>
                </div>
              )}
            </div>

            {isReplacingTeaser && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Al subir un nuevo archivo, se reemplazará el teaser actual de esta operación.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teaser-file">Seleccionar archivo</Label>
                <Input
                  id="teaser-file"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <p className="text-xs text-gray-500">
                  Formatos permitidos: PDF, DOC, DOCX (máx. 10MB)
                </p>
              </div>

              {uploadError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {selectedFile && !uploadError && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleUpload}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
