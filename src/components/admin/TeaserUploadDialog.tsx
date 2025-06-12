
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";
import { Operation } from "@/types/Operation";
import { useToast } from "@/hooks/use-toast";

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
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (PDF, DOC, DOCX)
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no válido",
          description: "Solo se permiten archivos PDF, DOC y DOCX",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "El archivo no puede superar los 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !operation) return;

    setIsUploading(true);
    
    try {
      // TODO: Implement actual file upload to Supabase Storage
      // For now, we'll simulate the upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate generating a URL
      const mockUrl = `https://example.com/teasers/${operation.id}/${selectedFile.name}`;
      
      onUploadComplete(operation.id, mockUrl);
      
      toast({
        title: "Teaser subido exitosamente",
        description: "El archivo se ha subido correctamente",
      });
      
      setSelectedFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading teaser:', error);
      toast({
        title: "Error al subir el archivo",
        description: "No se pudo subir el teaser. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Subir Teaser
          </DialogTitle>
        </DialogHeader>

        {operation && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium">{operation.company_name}</p>
              <p className="text-sm text-gray-600">{operation.sector}</p>
            </div>

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

              {selectedFile && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
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
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Teaser
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
