
import { Operation } from "@/types/Operation";

interface ProcessResult {
  operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[];
  errors: string[];
}

export const useCSVProcessor = () => {
  const processCSVText = (text: string): ProcessResult => {
    console.log('Procesando texto CSV:', text);
    
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return { operations: [], errors: ['No se encontraron datos para procesar'] };
    }

    const operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      // Saltar headers
      if (index === 0 && line.toLowerCase().includes('nombre') && line.toLowerCase().includes('empresa')) {
        return;
      }

      const values = line.split(',').map(v => v.trim());
      
      if (values.length < 5) {
        errors.push(`Línea ${index + 1}: Faltan campos obligatorios`);
        return;
      }

      try {
        const [
          company_name,
          cif = "",
          sector,
          operation_type,
          amount_str,
          currency = "EUR",
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
          project_name = ""
        ] = values;

        // Validar campos obligatorios
        if (!company_name || !sector || !operation_type || !amount_str || !date_str) {
          errors.push(`Línea ${index + 1}: Campos obligatorios faltantes`);
          return;
        }

        // Mapear tipos de operación con mejor cobertura
        const typeMap: { [key: string]: Operation['operation_type'] } = {
          'acquisition': 'merger',
          'adquisición': 'merger', 
          'adquisicion': 'merger',
          'merger': 'merger',
          'fusion': 'merger',
          'fusión': 'merger',
          'sale': 'sale',
          'venta': 'sale',
          'sell': 'sale',
          'funding': 'buy_mandate',
          'funding round': 'buy_mandate',
          'ronda': 'buy_mandate',
          'ronda de financiacion': 'buy_mandate',
          'buy_mandate': 'buy_mandate',
          'mandato compra': 'buy_mandate',
          'mandato de compra': 'buy_mandate',
          'partial_sale': 'partial_sale',
          'venta parcial': 'partial_sale',
          'parcial': 'partial_sale'
        };

        const normalizedType = operation_type.toLowerCase().trim();
        const mappedOperationType = typeMap[normalizedType] || 'sale';

        // Mapear estados
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

        // Parsear números de forma más robusta
        const amount = parseInt(amount_str.replace(/[^\d]/g, '')) || 0;
        const revenue = revenue_str && revenue_str.trim() && revenue_str !== 'N/A' 
          ? parseInt(revenue_str.replace(/[^\d]/g, '')) || null 
          : null;
        const ebitda = ebitda_str && ebitda_str.trim() && ebitda_str !== 'N/A' 
          ? parseInt(ebitda_str.replace(/[^\d-]/g, '')) || null 
          : null;

        // Parsear fecha
        let parsedDate = date_str;
        if (!date_str.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const dateObj = new Date(date_str);
          parsedDate = !isNaN(dateObj.getTime()) 
            ? dateObj.toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
        }

        const operation: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by"> = {
          company_name: company_name.trim(),
          project_name: project_name || null,
          cif: cif || null,
          sector: sector.trim(),
          operation_type: mappedOperationType,
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
          ebitda
        };

        operations.push(operation);

      } catch (error) {
        errors.push(`Línea ${index + 1}: Error al procesar - ${error}`);
      }
    });

    return { operations, errors };
  };

  return { processCSVText };
};
