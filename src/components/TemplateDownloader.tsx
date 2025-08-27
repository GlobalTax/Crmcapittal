
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { logger } from "@/utils/productionLogger";

export const TemplateDownloader = () => {
  const downloadTemplate = async () => {
    try {
      const ExcelJS = await import('exceljs');
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Plantilla Operaciones');

      // Define headers
      const headers = [
        'Nombre Empresa',
        'Nombre Proyecto', 
        'CIF',
        'Sector',
        'Tipo Operación',
        'Importe',
        'Moneda',
        'Fecha',
        'Comprador',
        'Vendedor',
        'Estado',
        'Descripción',
        'Ubicación',
        'Email Contacto',
        'Teléfono Contacto',
        'Facturación',
        'EBITDA',
        'Crecimiento Anual %'
      ];

      // Add headers
      worksheet.addRow(headers);

      // Add sample data
      const sampleData = [
        'Ejemplo Tech SL',
        'Proyecto Alpha 123',
        'B12345678',
        'Tecnología',
        'sale',
        5000000,
        'EUR',
        '2024-01-15',
        'TechCorp Inc',
        'Fundadores',
        'available',
        'Venta de startup tecnológica',
        'Madrid',
        'contacto@ejemplo.com',
        '+34 600 123 456',
        3000000,
        600000,
        25.5
      ];
      
      worksheet.addRow(sampleData);

      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F3FF' }
      };

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        if (column.header) {
          column.width = Math.max(column.header.toString().length + 2, 15);
        }
      });

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'plantilla_operaciones.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
    } catch (error) {
      logger.error('Failed to generate Excel template', { error });
    }
  };

  return (
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
  );
};
