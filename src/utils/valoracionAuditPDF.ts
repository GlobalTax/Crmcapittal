import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface AuditEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  user_email: string;
  user_name: string;
  created_at: string;
  metadata: Record<string, any>;
}

export interface ValoracionAuditData {
  valoracion: {
    id: string;
    company_name: string;
    client_name: string;
    status: string;
    created_at: string;
    assigned_to?: string;
  };
  activities: AuditEvent[];
}

export class ValoracionAuditPDFService {
  private static async loadJsPDF() {
    const { jsPDF } = await import('jspdf');
    return jsPDF;
  }

  static async generateAuditPDF(data: ValoracionAuditData): Promise<void> {
    try {
      const jsPDF = await this.loadJsPDF();
      const doc = new jsPDF();
      
      // Constants
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Header
      this.addHeader(doc, data.valoracion);
      
      // Summary
      let yPosition = this.addSummary(doc, data.valoracion, 60);
      
      // Activities
      yPosition = this.addActivitiesSection(doc, data.activities, yPosition + 20);
      
      // Footer
      this.addFooter(doc);
      
      // Save
      const fileName = `auditoria-valoracion-${data.valoracion.company_name.replace(/[^a-zA-Z0-9]/g, '_')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generating audit PDF:', error);
      throw new Error('Error al generar el PDF de auditoría');
    }
  }

  private static addHeader(doc: any, valoracion: ValoracionAuditData['valoracion']): void {
    // Title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('INFORME DE AUDITORÍA', doc.internal.pageSize.width / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.text('Valoración Empresarial', doc.internal.pageSize.width / 2, 45, { align: 'center' });
    
    // Company info
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Empresa: ${valoracion.company_name}`, 20, 65);
    doc.text(`Cliente: ${valoracion.client_name}`, 20, 75);
    
    // Generation info
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 20, 90);
    doc.text(`ID de Valoración: ${valoracion.id}`, 20, 100);
    
    // Separator line
    doc.setLineWidth(0.5);
    doc.line(20, 110, doc.internal.pageSize.width - 20, 110);
  }

  private static addSummary(doc: any, valoracion: ValoracionAuditData['valoracion'], yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('RESUMEN EJECUTIVO', 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    
    const summaryData = [
      ['Estado Actual:', valoracion.status],
      ['Fecha de Creación:', format(new Date(valoracion.created_at), 'dd/MM/yyyy', { locale: es })],
      ['Asignado a:', valoracion.assigned_to || 'No asignado'],
    ];
    
    summaryData.forEach(([label, value]) => {
      doc.setFont(undefined, 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 8;
    });
    
    return yPosition;
  }

  private static addActivitiesSection(doc: any, activities: AuditEvent[], yPosition: number): number {
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('HISTORIAL DETALLADO DE ACTIVIDADES', 20, yPosition);
    
    yPosition += 20;
    
    if (activities.length === 0) {
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text('No se encontraron actividades registradas.', 20, yPosition);
      return yPosition + 20;
    }
    
    activities.forEach((activity, index) => {
      // Check if we need a new page
      if (yPosition > doc.internal.pageSize.height - 50) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Activity header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${activity.title}`, 20, yPosition);
      
      yPosition += 8;
      
      // Activity details
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const activityDetails = [
        `Usuario: ${activity.user_email}`,
        `Fecha: ${format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`,
        `Tipo: ${activity.type}`
      ];
      
      activityDetails.forEach(detail => {
        doc.text(detail, 25, yPosition);
        yPosition += 6;
      });
      
      // Description with word wrapping
      if (activity.description) {
        yPosition += 3;
        doc.setFont(undefined, 'bold');
        doc.text('Descripción:', 25, yPosition);
        yPosition += 6;
        
        doc.setFont(undefined, 'normal');
        const descriptionLines = doc.splitTextToSize(activity.description, doc.internal.pageSize.width - 50);
        descriptionLines.forEach((line: string) => {
          if (yPosition > doc.internal.pageSize.height - 30) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, 25, yPosition);
          yPosition += 5;
        });
      }
      
      // Metadata if available
      if (activity.metadata && Object.keys(activity.metadata).length > 0) {
        yPosition += 3;
        doc.setFont(undefined, 'bold');
        doc.text('Metadatos:', 25, yPosition);
        yPosition += 6;
        
        doc.setFont(undefined, 'normal');
        Object.entries(activity.metadata).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const metadataText = `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`;
            const metadataLines = doc.splitTextToSize(metadataText, doc.internal.pageSize.width - 50);
            metadataLines.forEach((line: string) => {
              if (yPosition > doc.internal.pageSize.height - 30) {
                doc.addPage();
                yPosition = 30;
              }
              doc.text(line, 25, yPosition);
              yPosition += 5;
            });
          }
        });
      }
      
      yPosition += 10; // Space between activities
      
      // Separator line
      if (index < activities.length - 1) {
        doc.setLineWidth(0.2);
        doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
        yPosition += 10;
      }
    });
    
    return yPosition;
  }

  private static addFooter(doc: any): void {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setLineWidth(0.5);
      doc.line(20, doc.internal.pageSize.height - 25, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 25);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 15,
        { align: 'right' }
      );
      
      doc.text(
        'Documento generado automáticamente - Sistema de Valoraciones',
        20,
        doc.internal.pageSize.height - 15
      );
      
      doc.text(
        format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es }),
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 15,
        { align: 'center' }
      );
    }
  }
}