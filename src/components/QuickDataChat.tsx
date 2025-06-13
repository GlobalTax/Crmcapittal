
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Upload, AlertCircle, CheckCircle2, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Operation } from "@/types/Operation";
import { useCSVProcessor } from "@/hooks/useCSVProcessor";
import { OCRProcessor } from "./OCRProcessor";

interface QuickDataChatProps {
  onBulkAdd: (operationsData: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]) => Promise<{ error: string | null }>;
}

export const QuickDataChat = ({ onBulkAdd }: QuickDataChatProps) => {
  const [input, setInput] = useState("");
  const [detectedOperations, setDetectedOperations] = useState<Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [processingErrors, setProcessingErrors] = useState<string[]>([]);
  const [showOCR, setShowOCR] = useState(false);
  const { toast } = useToast();
  const { processCSVText } = useCSVProcessor();

  const handleProcess = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Por favor, pega algunos datos para procesar",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingErrors([]);
    
    try {
      const { operations, errors } = processCSVText(input);
      
      setProcessingErrors(errors);
      
      if (operations.length === 0) {
        toast({
          title: "No se detectaron operaciones",
          description: "Verifica que el formato de los datos sea correcto",
          variant: "destructive",
        });
      } else {
        setDetectedOperations(operations);
        toast({
          title: "Datos procesados",
          description: `Se detectaron ${operations.length} operaciones${errors.length > 0 ? ` (${errors.length} errores)` : ''}`,
          variant: errors.length > 0 ? "destructive" : "default",
        });
      }
    } catch (error) {
      console.error('Error procesando datos:', error);
      toast({
        title: "Error",
        description: "Hubo un problema procesando los datos",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (detectedOperations.length === 0) {
      toast({
        title: "Error",
        description: "No hay operaciones para subir",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      console.log('Subiendo operaciones:', detectedOperations);
      const { error } = await onBulkAdd(detectedOperations);
      
      if (error) {
        console.error('Error en subida:', error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Éxito!",
          description: `${detectedOperations.length} operaciones añadidas correctamente`,
        });
        setInput("");
        setDetectedOperations([]);
        setProcessingErrors([]);
      }
    } catch (error) {
      console.error('Error subiendo operaciones:', error);
      toast({
        title: "Error",
        description: "Hubo un problema subiendo las operaciones",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOCRTextExtracted = (text: string) => {
    setInput(text);
    toast({
      title: "Texto extraído",
      description: "El texto se ha añadido al área de entrada",
    });
  };

  const getOperationTypeLabel = (type: Operation['operation_type']) => {
    const labels = {
      'merger': 'Fusión/Adquisición',
      'sale': 'Venta',
      'partial_sale': 'Venta Parcial',
      'buy_mandate': 'Mandato Compra'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: Operation['status']) => {
    const labels = {
      'available': 'Disponible',
      'pending_review': 'Pendiente',
      'approved': 'Aprobada',
      'rejected': 'Rechazada',
      'in_process': 'En Proceso',
      'sold': 'Vendida',
      'withdrawn': 'Retirada'
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            Chat de Carga Rápida
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Formato: Nombre Empresa, CIF, Sector, Tipo Operación, Importe, Moneda, Fecha, Comprador, Vendedor, Estado, Descripción, Ubicación, Email, Teléfono, Facturación, EBITDA, Nombre Proyecto
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              onClick={() => setShowOCR(!showOCR)}
              className="border-black text-black hover:bg-gray-100 text-sm"
              size="sm"
            >
              <FileImage className="h-4 w-4 mr-2" />
              {showOCR ? 'Ocultar OCR' : 'Usar OCR'}
            </Button>
          </div>

          <Textarea
            placeholder="Ejemplo: TechCorp SL, B12345678, Tecnología, sale, 5000000, EUR, 2024-01-15, Buyer Corp, TechCorp, available, Venta de empresa tech, Madrid, contact@tech.com, +34600123456, 3000000, 600000, Proyecto Alpha"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[100px] sm:min-h-[120px] font-mono text-xs sm:text-sm resize-none"
          />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleProcess}
              disabled={isProcessing || !input.trim()}
              className="flex-1 text-sm"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Procesar Datos
            </Button>
            
            {detectedOperations.length > 0 && (
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
                variant="default"
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-sm"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                <span className="hidden sm:inline">Subir {detectedOperations.length} Operaciones</span>
                <span className="sm:hidden">Subir ({detectedOperations.length})</span>
              </Button>
            )}
          </div>

          {processingErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-medium text-red-800 mb-2 text-sm">Errores de procesamiento:</h4>
              <ul className="text-xs sm:text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {processingErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {showOCR && (
        <OCRProcessor onTextExtracted={handleOCRTextExtracted} />
      )}

      {detectedOperations.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              Operaciones Detectadas ({detectedOperations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detectedOperations.map((operation, index) => (
                <div key={index} className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">{operation.company_name}</h4>
                      {operation.project_name && (
                        <p className="text-xs sm:text-sm text-blue-600 truncate">{operation.project_name}</p>
                      )}
                      <div className="text-xs sm:text-sm text-gray-600 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                        <span className="truncate">Sector: {operation.sector}</span>
                        <span className="truncate">Ubicación: {operation.location || 'N/A'}</span>
                        <span>Importe: €{(operation.amount / 1000000).toFixed(1)}M</span>
                        <span>Fecha: {new Date(operation.date).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 sm:items-end">
                      <Badge variant="outline" className="text-xs">
                        {getOperationTypeLabel(operation.operation_type)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusLabel(operation.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {input.trim() && detectedOperations.length === 0 && processingErrors.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm">
                Haz clic en "Procesar Datos" para analizar el texto pegado y detectar operaciones.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
