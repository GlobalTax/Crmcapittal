
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle } from "lucide-react";

interface FileSelectorProps {
  selectedFile: File | null;
  uploadError: string | null;
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileSelector = ({ 
  selectedFile, 
  uploadError, 
  isUploading, 
  onFileSelect 
}: FileSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="teaser-file">Seleccionar archivo</Label>
      <Input
        id="teaser-file"
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onFileSelect}
        disabled={isUploading}
      />
      <p className="text-xs text-gray-500">
        Formatos permitidos: PDF, DOC, DOCX (máx. 10MB)
      </p>

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
  );
};
