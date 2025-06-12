
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

export const TemplateDownloader = () => {
  const downloadTemplate = () => {
    const template = [
      {
        'Nombre Empresa': 'Ejemplo Tech SL',
        'Nombre Proyecto': 'Proyecto Alpha 123',
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
