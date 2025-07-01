
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, XCircle } from "lucide-react";
import { Operation } from "@/types/Operation";
import { useTeaserUpload } from "@/hooks/admin/useTeaserUpload";
import { OperationInfo } from "./teaser/OperationInfo";
import { FileSelector } from "./teaser/FileSelector";
import { TeaserActions } from "./teaser/TeaserActions";

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
  const {
    selectedFile,
    uploadError,
    isUploading,
    isReplacingTeaser,
    handleFileSelect,
    handleUpload,
    resetDialog
  } = useTeaserUpload(operation, onUploadComplete, () => onOpenChange(false));

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isReplacingTeaser ? 'Cambiar Teaser' : 'Subir Teaser'}
          </DialogTitle>
        </DialogHeader>

        {operation && (
          <div className="space-y-6">
            <OperationInfo operation={operation} />

            {isReplacingTeaser && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Al subir un nuevo archivo, se reemplazará el teaser actual de esta operación.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <FileSelector
                selectedFile={selectedFile}
                uploadError={uploadError}
                isUploading={isUploading}
                onFileSelect={handleFileSelect}
              />

              {uploadError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
            </div>

            <TeaserActions
              selectedFile={selectedFile}
              isUploading={isUploading}
              uploadError={uploadError}
              isReplacingTeaser={!!isReplacingTeaser}
              onCancel={() => onOpenChange(false)}
              onUpload={handleUpload}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
