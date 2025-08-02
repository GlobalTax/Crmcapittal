
import { useState } from "react";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { useOperationsContext } from '@/contexts';
import { TargetCompany } from "@/types/TargetCompany";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConvertToOperationDialogProps {
  target: TargetCompany;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ConvertToOperationDialog = ({ target, open, onOpenChange }: ConvertToOperationDialogProps) => {
  const { updateStatus } = useTargetCompanies();
  const { createOperation } = useOperationsContext();
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleConvert = async () => {
    setIsConverting(true);
    setResult(null);

    try {
      // Create operation from target company data
      const operationData = {
        company_name: target.name,
        sector: target.industry || 'No especificado',
        operation_type: 'buy_mandate', // Default to buy mandate for sourcing targets
        amount: target.revenue || 1000000, // Use revenue as estimated amount, default to 1M
        currency: 'EUR',
        date: new Date().toISOString().split('T')[0],
        description: target.description || '',
        status: 'available',
        contact_email: target.contacts?.[0]?.email || null,
        revenue: target.revenue || null,
        ebitda: target.ebitda || null,
      };

      await createOperation(operationData);

      // Update target status to CONVERTED_TO_DEAL
      const statusResult = await updateStatus(target.id, 'CONVERTED_TO_DEAL');
      
      if (statusResult.error) {
        throw new Error(statusResult.error);
      }

      setResult({
        success: true,
        message: `✅ ${target.name} ha sido convertida exitosamente a una operación del portfolio.`
      });

    } catch (error) {
      console.error('Error converting target to operation:', error);
      setResult({
        success: false,
        message: `❌ Error en la conversión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Convertir a Operación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  ¿Estás seguro de que quieres convertir <strong>{target.name}</strong> en una operación formal del portfolio?
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium">Se creará una operación con:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Empresa:</strong> {target.name}</li>
                  <li>• <strong>Sector:</strong> {target.industry || 'No especificado'}</li>
                  <li>• <strong>Tipo:</strong> Mandato de Compra</li>
                  {target.revenue && <li>• <strong>Ingresos:</strong> €{(target.revenue / 1000000).toFixed(1)}M</li>}
                  {target.ebitda && <li>• <strong>EBITDA:</strong> €{(target.ebitda / 1000000).toFixed(1)}M</li>}
                </ul>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isConverting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConvert}
                  disabled={isConverting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isConverting ? "Convirtiendo..." : "Convertir a Operación"}
                </Button>
              </div>
            </>
          )}

          {result && (
            <>
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>

              <div className="flex justify-end pt-4">
                <Button onClick={handleClose}>
                  Cerrar
                </Button>
              </div>
            </>
          )}

          {isConverting && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Creando operación...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
