
import { useState, useRef } from "react";
import { useTargetCompanies } from "@/hooks/useTargetCompanies";
import { CreateTargetCompanyData } from "@/types/TargetCompany";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkImportDialog = ({ open, onOpenChange }: BulkImportDialogProps) => {
  const { bulkImportTargets } = useTargetCompanies();
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const csvContent = `Nombre Empresa,Website,Sector,Descripción,Tesis de Inversión,Fit Score,Ingresos,EBITDA,Notas de Origen
TechCorp S.L.,https://techcorp.com,Tecnología,Empresa de desarrollo de software,Crecimiento sostenible y tecnología innovadora,4,2000000,400000,Referencia de partner estratégico
HealthTech Ltd.,https://healthtech.com,Salud,Plataforma de telemedicina,Mercado en expansión post-COVID,5,5000000,1000000,Lead inbound del website`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "plantilla_empresas_objetivo.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('El archivo debe contener al menos una fila de encabezados y una fila de datos');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const dataLines = lines.slice(1);

      const targets: CreateTargetCompanyData[] = dataLines.map(line => {
        const values = line.split(',').map(v => v.trim());
        
        return {
          name: values[0] || '',
          website: values[1] || undefined,
          industry: values[2] || undefined,
          description: values[3] || undefined,
          investment_thesis: values[4] || undefined,
          fit_score: values[5] ? parseInt(values[5]) : undefined,
          revenue: values[6] ? parseFloat(values[6]) : undefined,
          ebitda: values[7] ? parseFloat(values[7]) : undefined,
          source_notes: values[8] || undefined,
        };
      }).filter(target => target.name); // Filter out empty names

      const result = await bulkImportTargets(targets);
      
      if (result.success) {
        setImportResult(`✅ Importación exitosa: ${result.successCount} empresas añadidas`);
      } else {
        setImportResult(`❌ Error en la importación: ${result.error}`);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      setImportResult(`❌ Error procesando el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importación Masiva de Empresas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Descarga la plantilla CSV para asegurar el formato correcto de los datos.
            </AlertDescription>
          </Alert>

          <Button
            onClick={downloadTemplate}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Descargar Plantilla CSV
          </Button>

          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">
              Subir archivo CSV:
            </label>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isProcessing}
            />
          </div>

          {isProcessing && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Procesando archivo...</p>
            </div>
          )}

          {importResult && (
            <Alert className={importResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription>{importResult}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              {importResult?.includes('✅') ? 'Cerrar' : 'Cancelar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
