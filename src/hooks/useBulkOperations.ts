
import { useState } from 'react';
import { Operation } from '@/types/Operation';
import { useToast } from '@/hooks/use-toast';

interface BulkOperationResult {
  success: boolean;
  data?: any[];
  error?: string;
}

export const useBulkOperations = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateExcelData = (data: any[]): { valid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    const requiredFields = ['Nombre Empresa', 'Sector', 'Tipo Operación', 'Importe', 'Fecha'];
    const validOperationTypes = ['merger', 'sale', 'partial_sale', 'buy_mandate'];
    const validStatuses = ['available', 'pending_review', 'approved', 'rejected', 'in_process', 'sold', 'withdrawn'];

    data.forEach((row, index) => {
      const rowNum = index + 2;
      
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
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  };

  const transformExcelToOperations = (jsonData: any[]): Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[] => {
    return jsonData.map((row: any) => ({
      company_name: row['Nombre Empresa'],
      project_name: row['Nombre Proyecto'] || null,
      cif: row['CIF'] || null,
      sector: row['Sector'],
      operation_type: row['Tipo Operación'] as Operation['operation_type'],
      amount: Number(row['Importe']),
      currency: row['Moneda'] || 'EUR',
      date: new Date(row['Fecha']).toISOString().split('T')[0],
      buyer: row['Comprador'] || null,
      seller: row['Vendedor'] || null,
      status: (row['Estado'] || 'available') as Operation['status'],
      description: row['Descripción'] || null,
      location: row['Ubicación'] || null,
      contact_email: row['Email Contacto'] || null,
      contact_phone: row['Teléfono Contacto'] || null,
      revenue: row['Facturación'] ? Number(row['Facturación']) : null,
      ebitda: row['EBITDA'] ? Number(row['EBITDA']) : null,
      annual_growth_rate: row['Crecimiento Anual %'] ? Number(row['Crecimiento Anual %']) : null,
      manager_id: null,
      teaser_url: null
    }));
  };

  const processBulkUpload = async (
    file: File,
    onBulkAdd: (operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]) => Promise<{ error?: string }>
  ): Promise<BulkOperationResult> => {
    setIsProcessing(true);
    
    try {
      const XLSX = await import('xlsx');
      
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const validation = validateExcelData(jsonData);
            
            if (!validation.valid) {
              toast({
                title: "Errores de validación",
                description: `Se encontraron ${validation.errors.length} errores`,
                variant: "destructive",
              });
              resolve({ success: false, error: validation.errors.join(', ') });
              return;
            }

            const operations = transformExcelToOperations(jsonData);
            const result = await onBulkAdd(operations);
            
            if (result.error) {
              toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
              });
              resolve({ success: false, error: result.error });
            } else {
              toast({
                title: "Éxito",
                description: `Se han importado ${operations.length} operaciones correctamente. Listas para sincronizar con capitalmarket.com`,
              });
              resolve({ success: true, data: operations });
            }
            
          } catch (error) {
            const errorMsg = "Error al procesar los datos del archivo";
            toast({
              title: "Error",
              description: errorMsg,
              variant: "destructive",
            });
            resolve({ success: false, error: errorMsg });
          }
        };
        
        reader.readAsArrayBuffer(file);
      });
      
    } catch (error) {
      const errorMsg = "Error al procesar el archivo";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      return { success: false, error: errorMsg };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    validateExcelData,
    transformExcelToOperations,
    processBulkUpload
  };
};
