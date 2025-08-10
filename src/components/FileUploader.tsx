
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export const FileUploader = ({ 
  onFileSelect, 
  accept = ".xlsx,.xls,.csv",
  maxSizeMB = 10
}: FileUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos Excel (.xlsx, .xls) o CSV",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast({
        title: "Error",
        description: `El archivo es demasiado grande. Máximo ${maxSizeMB}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Subir Archivo</h3>
      <input
        type="file"
        accept={accept}
        onChange={handleFileUpload}
        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
      />
      {selectedFile && (
        <p className="text-sm text-muted-foreground">
          Archivo seleccionado: {selectedFile.name}
        </p>
      )}
    </div>
  );
};
