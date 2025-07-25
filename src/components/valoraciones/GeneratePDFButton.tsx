import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Valoracion } from '@/types/Valoracion';
import { toast } from '@/hooks/use-toast';

interface GeneratePDFButtonProps {
  valoracion: Valoracion;
  className?: string;
}

export const GeneratePDFButton: React.FC<GeneratePDFButtonProps> = ({ 
  valoracion, 
  className = "" 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Importar jsPDF de forma dinámica para reducir el bundle inicial
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('Informe de Valoración', 20, 30);
      
      doc.setFontSize(12);
      doc.text(`Empresa: ${valoracion.company_name}`, 20, 50);
      doc.text(`Cliente: ${valoracion.client_name}`, 20, 60);
      doc.text(`Estado: ${valoracion.status}`, 20, 70);
      
      if (valoracion.company_sector) {
        doc.text(`Sector: ${valoracion.company_sector}`, 20, 80);
      }

      // Información financiera
      let yPosition = 100;
      doc.setFontSize(14);
      doc.text('Información Financiera', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      if (valoracion.fee_quoted) {
        doc.text(`Honorarios Cotizados: €${valoracion.fee_quoted.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
      }
      
      if (valoracion.fee_charged) {
        doc.text(`Honorarios Cobrados: €${valoracion.fee_charged.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
      }

      if (valoracion.valoracion_ev) {
        doc.text(`Enterprise Value: €${valoracion.valoracion_ev.toLocaleString()}`, 20, yPosition);
        yPosition += 10;
      }

      // Fechas importantes
      yPosition += 10;
      doc.setFontSize(14);
      doc.text('Fechas Importantes', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.text(`Fecha de creación: ${new Date(valoracion.created_at).toLocaleDateString('es-ES')}`, 20, yPosition);
      yPosition += 10;
      
      doc.text(`Última actualización: ${new Date(valoracion.updated_at).toLocaleDateString('es-ES')}`, 20, yPosition);
      yPosition += 10;

      if (valoracion.estimated_delivery) {
        doc.text(`Entrega estimada: ${new Date(valoracion.estimated_delivery).toLocaleDateString('es-ES')}`, 20, yPosition);
      }

      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text('Generado automáticamente - CRM Pro M&A Platform', 20, pageHeight - 20);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, pageHeight - 10);

      // Descargar el PDF
      const fileName = `valoracion_${valoracion.company_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      toast({
        title: "PDF Generado",
        description: "El informe PDF se ha descargado correctamente"
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generatePDF}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <FileText className="h-4 w-4 mr-2 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Generar PDF
        </>
      )}
    </Button>
  );
};