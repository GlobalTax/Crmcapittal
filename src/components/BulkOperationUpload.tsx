
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Operation } from '@/types/Operation';

interface BulkOperationUploadProps {
  onBulkAdd: (operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]) => Promise<{ error?: string }>;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const BulkOperationUpload = ({ onBulkAdd }: BulkOperationUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        'Nombre Empresa': 'Ejemplo Tech SL',
        'CIF': 'B12345678',
        'Sector': 'Tecnología',
        'Tipo Operación': 'sale',
        'Importe': 5000000,
        'Moneda': 'EUR',
        'Fecha': '2024-01-15',
        'Comprador': 'TechCorp Inc',
        'Vendedor': 'Fundadores',
        'Estado': 'available',
        'Descripción': 'Venta de startup tecnológica',
        'Ubicación': 'Madrid',
        'Email Contacto': 'contacto@ejemplo.com',
        'Teléfono Contacto': '+34 600 123 456',
        'Facturación': 3000000,
        'EBITDA': 600000,
        'Crecimiento Anual %': 25.5
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Operaciones');
    XLSX.writeFile(wb, 'plantilla_operaciones.xlsx');
  };

  const validateOperationData = (data: any[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const requiredFields = ['Nombre Empresa', 'Sector', 'Tipo Operación', 'Importe', 'Fecha'];
    const validOperationTypes = ['merger', 'sale', 'partial_sale', 'buy_mandate'];
    const validStatuses = ['available', 'pending_review', 'approved', 'rejected', 'in_process', 'sold', 'withdrawn'];

    data.forEach((row, index) => {
      const rowNum = index + 2; // Excel row number (starting from 2 since row 1 is headers)
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(`Fila ${rowNum}: ${field} es obligatorio`);
        }
      });

      // Validate operation type
      if (row['Tipo Operación'] && !validOperationTypes.includes(row['Tipo Operación'])) {
        errors.push(`Fila ${rowNum}: Tipo Operación debe ser uno de: ${validOperationTypes.join(', ')}`);
      }

      // Validate status
      if (row['Estado'] && !validStatuses.includes(row['Estado'])) {
        errors.push(`Fila ${rowNum}: Estado debe ser uno de: ${validStatuses.join(', ')}`);
      }

      // Validate amount
      if (row['Importe'] && (isNaN(row['Importe']) || row['Importe'] <= 0)) {
        errors.push(`Fila ${rowNum}: Importe debe ser un número positivo`);
      }

      // Validate date format
      if (row['Fecha']) {
        const date = new Date(row['Fecha']);
        if (isNaN(date.getTime())) {
          errors.push(`Fila ${rowNum}: Fecha debe tener formato válido (YYYY-MM-DD)`);
        }
      }

      // Validate email format
      if (row['Email Contacto']) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row['Email Contacto'])) {
          warnings.push(`Fila ${rowNum}: Email de contacto tiene formato inválido`);
        }
      }

      // Validate numeric fields
      ['Facturación', 'EBITDA', 'Crecimiento Anual %'].forEach(field => {
        if (row[field] && row[field] !== '' && isNaN(row[field])) {
          warnings.push(`Fila ${rowNum}: ${field} debe ser un número`);
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!allowedTypes.includes(uploadedFile.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos Excel (.xlsx, .xls) o CSV",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        setPreview(jsonData.slice(0, 5)); // Show first 5 rows as preview
        
        const validationResult = validateOperationData(jsonData);
        setValidation(validationResult);
        
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al procesar el archivo. Verifica que tenga el formato correcto.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsArrayBuffer(uploadedFile);
  };

  const processAndUpload = async () => {
    if (!file || !validation?.valid) return;

    setIsProcessing(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Transform data to match Operation interface
          const operations = jsonData.map((row: any) => ({
            company_name: row['Nombre Empresa'],
            cif: row['CIF'] || null,
            sector: row['Sector'],
            operation_type: row['Tipo Operación'],
            amount: Number(row['Importe']),
            currency: row['Moneda'] || 'EUR',
            date: new Date(row['Fecha']).toISOString().split('T')[0],
            buyer: row['Comprador'] || null,
            seller: row['Vendedor'] || null,
            status: row['Estado'] || 'available',
            description: row['Descripción'] || null,
            location: row['Ubicación'] || null,
            contact_email: row['Email Contacto'] || null,
            contact_phone: row['Teléfono Contacto'] || null,
            revenue: row['Facturación'] ? Number(row['Facturación']) : null,
            ebitda: row['EBITDA'] ? Number(row['EBITDA']) : null,
            annual_growth_rate: row['Crecimiento Anual %'] ? Number(row['Crecimiento Anual %']) : null
          }));

          const result = await onBulkAdd(operations);
          
          if (result.error) {
            toast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Éxito",
              description: `Se han importado ${operations.length} operaciones correctamente`,
            });
            setIsOpen(false);
            setFile(null);
            setPreview([]);
            setValidation(null);
          }
          
        } catch (error) {
          toast({
            title: "Error",
            description: "Error al procesar los datos del archivo",
            variant: "destructive",
          });
        }
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir las operaciones",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-black text-black hover:bg-gray-100">
          <Upload className="h-4 w-4 mr-2" />
          Subida Masiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subida Masiva de Operaciones</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium">Descargar Plantilla</h3>
              <p className="text-sm text-gray-600">
                Descarga la plantilla Excel para ver el formato requerido
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="font-medium">Subir Archivo</h3>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            {file && (
              <p className="text-sm text-gray-600">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {/* Validation Results */}
          {validation && (
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
                  <ul className="text-sm text-red-700 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Advertencias:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validation.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Vista Previa (primeras 5 filas)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).slice(0, 6).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-sm font-medium border-b">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).slice(0, 6).map((value: any, i) => (
                          <td key={i} className="px-4 py-2 text-sm border-b">
                            {value?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={processAndUpload}
              disabled={!validation?.valid || isProcessing}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isProcessing ? 'Procesando...' : 'Importar Operaciones'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
