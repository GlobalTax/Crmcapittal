
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Download, Upload } from "lucide-react";
import { Operation } from "@/types/Operation";

interface OperationTeaserCellProps {
  operation: Operation;
  onUpload: (operation: Operation) => void;
  onDownload: (operation: Operation) => void;
}

export const OperationTeaserCell = ({ 
  operation, 
  onUpload, 
  onDownload 
}: OperationTeaserCellProps) => {
  return (
    <div className="flex items-center space-x-2">
      {operation.teaser_url ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(operation)}
            className="h-6 px-2 text-xs"
          >
            <Download className="h-3 w-3 mr-1" />
            Ver
          </Button>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-gray-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpload(operation)}
            className="h-6 px-2 text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Subir
          </Button>
        </>
      )}
    </div>
  );
};
