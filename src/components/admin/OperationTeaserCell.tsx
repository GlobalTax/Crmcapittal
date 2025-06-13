
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Download, Upload, RefreshCw, Trash2 } from "lucide-react";
import { Operation } from "@/types/Operation";

interface OperationTeaserCellProps {
  operation: Operation;
  onUpload: (operation: Operation) => void;
  onDownload: (operation: Operation) => void;
  onDelete?: (operation: Operation) => void;
}

export const OperationTeaserCell = ({ 
  operation, 
  onUpload, 
  onDownload,
  onDelete
}: OperationTeaserCellProps) => {
  return (
    <div className="flex items-center justify-center space-x-1">
      {operation.teaser_url ? (
        <>
          <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-md">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Disponible</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(operation)}
            className="h-7 w-7 p-0 hover:bg-blue-50"
            title="Descargar teaser"
          >
            <Download className="h-3 w-3 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpload(operation)}
            className="h-7 w-7 p-0 hover:bg-orange-50"
            title="Modificar teaser"
          >
            <RefreshCw className="h-3 w-3 text-orange-600" />
          </Button>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(operation)}
              className="h-7 w-7 p-0 hover:bg-red-50"
              title="Quitar teaser"
            >
              <Trash2 className="h-3 w-3 text-red-600" />
            </Button>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
            <XCircle className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">Sin teaser</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpload(operation)}
            className="h-7 w-7 p-0 hover:bg-green-50"
            title="Subir teaser"
          >
            <Upload className="h-3 w-3 text-green-600" />
          </Button>
        </>
      )}
    </div>
  );
};
