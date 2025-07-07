import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { format as formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Deal } from '@/types/Deal';
import type { DocumentTemplate, DocumentVariables, DocumentFormat, GeneratedDocument } from '@/types/DocumentGenerator';

export class DocumentGeneratorService {
  /**
   * Map deal data to template variables
   */
  static mapDealToVariables(
    deal: Deal, 
    currentUser: { name: string; email: string; }
  ): DocumentVariables {
    const currentDate = formatDate(new Date(), 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
    
    return {
      // Client data from deal
      client_name: deal.contact?.name || 'Cliente',
      company_name: deal.company?.name || 'Empresa',
      client_email: deal.contact?.email || '',
      
      // Advisor data from current user
      advisor_name: currentUser.name,
      advisor_email: currentUser.email,
      
      // Deal data
      deal_description: deal.title || 'Operación',
      deal_value: deal.amount ? `${deal.amount.toLocaleString('es-ES')}` : 'A determinar',
      deal_type: 'venta',
      sector: deal.company?.industry || 'General',
      
      // Template-specific defaults
      commission_percentage: '3',
      minimum_fee: '25.000',
      mandate_duration: '12',
      exclusivity_clause: 'Este mandato se otorga en régimen de exclusividad',
      
      // General data
      location: 'Madrid',
      date: currentDate
    };
  }

  /**
   * Process template content by replacing variables
   */
  static processTemplate(template: DocumentTemplate, variables: Partial<DocumentVariables>): string {
    let content = template.content.content;
    
    // Replace all variables in the template
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(placeholder, value || `[${key}]`);
    });
    
    return content;
  }

  /**
   * Generate PDF document
   */
  static generatePDF(title: string, content: string): Blob {
    const doc = new jsPDF();
    
    // Set font and title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 30);
    
    // Add content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Split content into lines and handle page breaks
    const lines = doc.splitTextToSize(content, 170);
    let y = 50;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;
    const marginBottom = 20;
    
    lines.forEach((line: string) => {
      if (y + lineHeight > pageHeight - marginBottom) {
        doc.addPage();
        y = 30;
      }
      doc.text(line, 20, y);
      y += lineHeight;
    });
    
    return doc.output('blob');
  }

  /**
   * Generate DOCX document
   */
  static async generateDOCX(title: string, content: string): Promise<Blob> {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').map(paragraph => {
      if (paragraph.trim() === title) {
        return new Paragraph({
          children: [
            new TextRun({
              text: paragraph,
              bold: true,
              size: 32
            })
          ]
        });
      }
      
      return new Paragraph({
        children: [
          new TextRun({
            text: paragraph,
            size: 22
          })
        ]
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    return await Packer.toBlob(doc);
  }

  /**
   * Generate document in specified format
   */
  static async generateDocument(
    template: DocumentTemplate,
    variables: Partial<DocumentVariables>,
    format: DocumentFormat
  ): Promise<GeneratedDocument> {
    const processedContent = this.processTemplate(template, variables);
    const title = template.content.title;
    
    let blob: Blob;
    let mimeType: string;
    let extension: string;
    
    if (format === 'pdf') {
      blob = this.generatePDF(title, processedContent);
      mimeType = 'application/pdf';
      extension = 'pdf';
    } else {
      blob = await this.generateDOCX(title, processedContent);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extension = 'docx';
    }
    
    // Generate filename based on template type and date
    const dateStr = formatDate(new Date(), 'yyyy-MM-dd');
    const filename = `${template.template_type}_${dateStr}.${extension}`;
    
    return {
      blob,
      filename,
      mimeType
    };
  }

  /**
   * Download generated document
   */
  static downloadDocument(generatedDoc: GeneratedDocument): void {
    saveAs(generatedDoc.blob, generatedDoc.filename);
  }
}