import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Operation } from "@/types/Operation";

interface QuickDataChatProps {
  onBulkAdd: (operationsData: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]) => Promise<{ error: string | null }>;
}

export const QuickDataChat = ({ onBulkAdd }: QuickDataChatProps) => {
  const [input, setInput] = useState("");
  const [detectedOperations, setDetectedOperations] = useState<Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const processText = (text: string) => {
    console.log('Procesando texto:', text);
    
    // Dividir por líneas y filtrar líneas vacías
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return [];
    }

    const operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[] = [];

    lines.forEach((line, index) => {
      // Saltar la primera línea si parece ser un header
      if (index === 0 && line.toLowerCase().includes('nombre') && line.toLowerCase().includes('empresa')) {
        return;
      }

      // Dividir por comas, pero manejar comas dentro de comillas
      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 7) {
        console.log('Línea con pocos campos:', line);
        return;
      }

      try {
        // Mapear los campos según el formato esperado
        const [
          company_name,
          cif,
          sector,
          operation_type,
          amount_str,
          currency,
          date_str,
          buyer = "",
          seller = "",
          status_str = "available",
          description = "",
          location = "",
          contact_email = "",
          contact_phone = "",
          revenue_str = "",
          ebitda_str = "",
          annual_growth_rate_str = ""
        ] = values;

        // Validar campos obligatorios
        if (!company_name || !sector || !operation_type || !amount_str || !date_str) {
          console.log('Campos obligatorios faltantes en línea:', line);
          return;
        }

        // Convertir tipos de operación - Usando solo los valores exactos de la base de datos
        const typeMap: { [key: string]: Operation['operation_type'] } = {
          'acquisition': 'merger',
          'adquisición': 'merger', 
          'merger': 'merger',
          'fusión': 'merger',
          'sale': 'sale',
          'venta': 'sale',
          'funding round': 'buy_mandate',
          'ronda': 'buy_mandate',
          'buy_mandate': 'buy_mandate',
          'mandato compra': 'buy_mandate',
          'mandato de compra': 'buy_mandate',
          'partial_sale': 'partial_sale',
          'venta parcial': 'partial_sale'
        };

        const normalizedType = operation_type.toLowerCase().trim();
        const mappedOperationType = typeMap[normalizedType];
        
        if (!mappedOperationType) {
          console.log('Tipo de operación no reconocido:', operation_type, 'usando sale como default');
        }
        
        const finalOperationType = mappedOperationType || 'sale';

        // Convertir estados - Usando solo los valores exactos de la base de datos
        const statusMap: { [key: string]: Operation['status'] } = {
          'completed': 'available',
          'completado': 'available',
          'available': 'available',
          'disponible': 'available',
          'in progress': 'in_process',
          'en progreso': 'in_process',
          'in_process': 'in_process',
          'pending': 'pending_review',
          'pendiente': 'pending_review',
          'pending_review': 'pending_review'
        };

        const normalizedStatus = status_str.toLowerCase().trim();
        const mappedStatus = statusMap[normalizedStatus] || 'available';

        // Parsear números
        const amount = parseInt(amount_str.replace(/[^\d]/g, '')) || 0;
        const revenue = revenue_str && revenue_str.trim() && revenue_str !== 'N/A' ? parseInt(revenue_str.replace(/[^\d]/g, '')) || null : null;
        const ebitda = ebitda_str && ebitda_str.trim() && ebitda_str !== 'N/A' ? parseInt(ebitda_str.replace(/[^\d-]/g, '')) || null : null;
        const annual_growth_rate = annual_growth_rate_str && annual_growth_rate_str.trim() && annual_growth_rate_str !== 'N/A' 
          ? parseFloat(annual_growth_rate_str.replace(/[^\d.-]/g, '')) || null 
          : null;

        // Parsear fecha (formato YYYY-MM-DD)
        let parsedDate = date_str;
        if (date_str.includes('-') && date_str.length === 10) {
          parsedDate = date_str;
        } else {
          // Intentar otros formatos
          const dateObj = new Date(date_str);
          if (!isNaN(dateObj.getTime())) {
            parsedDate = dateObj.toISOString().split('T')[0];
          } else {
            parsedDate = new Date().toISOString().split('T')[0];
          }
        }

        const operation: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by"> = {
          company_name: company_name.trim(),
          cif: cif || null,
          sector: sector.trim(),
          operation_type: finalOperationType,
          amount,
          currency: currency || 'EUR',
          date: parsedDate,
          buyer: buyer || null,
          seller: seller || null,
          status: mappedStatus,
          description: description || null,
          location: location || null,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          revenue,
          ebitda,
          annual_growth_rate
        };

        console.log('Operación procesada:', operation);
        console.log('Tipo final:', finalOperationType, 'Estado final:', mappedStatus);
        operations.push(operation);

      } catch (error) {
        console.error('Error procesando línea:', line, error);
      }
    });

    return operations;
  };

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
    
    try {
      const operations = processText(input);
      
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
          description: `Se detectaron ${operations.length} operaciones`,
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
      const { error } = await onBulkAdd(detectedOperations);
      
      if (error) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Chat de Carga Rápida
          </CardTitle>
          <p className="text-sm text-gray-600">
            Pega datos de operaciones separados por comas y procésalos automáticamente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Pega aquí los datos de las operaciones (formato CSV)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm"
          />
          
          <div className="flex gap-2">
            <Button 
              onClick={handleProcess}
              disabled={isProcessing || !input.trim()}
              className="flex-1"
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
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Subir {detectedOperations.length} Operaciones
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {detectedOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Operaciones Detectadas ({detectedOperations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detectedOperations.map((operation, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{operation.company_name}</h4>
                      <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-2">
                        <span>Sector: {operation.sector}</span>
                        <span>Ubicación: {operation.location || 'N/A'}</span>
                        <span>Importe: €{(operation.amount / 1000000).toFixed(1)}M</span>
                        <span>Fecha: {new Date(operation.date).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {getOperationTypeLabel(operation.operation_type)}
                      </Badge>
                      <Badge variant="secondary">
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

      {input.trim() && detectedOperations.length === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Haz clic en "Procesar Datos" para analizar el texto pegado y detectar operaciones.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
