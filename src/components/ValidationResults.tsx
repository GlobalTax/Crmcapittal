
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ValidationResultsProps {
  validation: {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } | null;
}

export const ValidationResults = ({ validation }: ValidationResultsProps) => {
  if (!validation) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        {validation.valid ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        )}
        <h3 className="font-medium">
          {validation.valid ? 'Validación Exitosa' : 'Errores de Validación'}
        </h3>
      </div>

      {validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Errores:</h4>
          <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Advertencias:</h4>
          <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
            {validation.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
