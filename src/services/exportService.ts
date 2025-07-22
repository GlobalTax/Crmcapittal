
import { logger } from '@/utils/logger';
import { supabase } from '@/integrations/supabase/client';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  data: any[];
  filename: string;
  chunkSize?: number;
  includeHeaders?: boolean;
  customFields?: string[];
}

export interface ExportProgress {
  current: number;
  total: number;
  percentage: number;
  message: string;
}

class ExportService {
  private onProgress?: (progress: ExportProgress) => void;
  
  setProgressCallback(callback: (progress: ExportProgress) => void) {
    this.onProgress = callback;
  }
  
  private reportProgress(current: number, total: number, message: string) {
    if (this.onProgress) {
      this.onProgress({
        current,
        total,
        percentage: Math.round((current / total) * 100),
        message
      });
    }
  }
  
  async exportData(options: ExportOptions): Promise<void> {
    const { format, data, filename, chunkSize = 1000 } = options;
    
    logger.info(`Starting export: ${format}`, {
      recordCount: data.length,
      filename,
      chunkSize
    });
    
    try {
      switch (format) {
        case 'pdf':
          await this.exportToPDF(options);
          break;
        case 'excel':
          await this.exportToExcel(options);
          break;
        case 'csv':
          await this.exportToCSV(options);
          break;
        default:
          throw new Error(`Formato no soportado: ${format}`);
      }
      
      logger.info(`Export completed successfully: ${filename}`);
    } catch (error) {
      logger.error(`Export failed: ${filename}`, error);
      throw error;
    }
  }
  
  private async exportToPDF(options: ExportOptions): Promise<void> {
    const { data, filename } = options;
    
    // Para datasets grandes, usar edge function
    if (data.length > 500) {
      await this.exportLargePDF(options);
      return;
    }
    
    // Para datasets pequeños, usar jsPDF local
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;
    
    this.reportProgress(0, data.length, 'Generando PDF...');
    
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Renderizar item (simplificado)
      doc.text(JSON.stringify(item), 10, yPosition);
      yPosition += 10;
      
      if (i % 50 === 0) {
        this.reportProgress(i, data.length, `Procesando registro ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 0)); // Yield control
      }
    }
    
    doc.save(filename);
    this.reportProgress(data.length, data.length, 'PDF generado exitosamente');
  }
  
  private async exportLargePDF(options: ExportOptions): Promise<void> {
    const { data, filename } = options;
    
    this.reportProgress(0, 100, 'Enviando datos al servidor...');
    
    try {
      const { data: result, error } = await supabase.functions.invoke('export-large-pdf', {
        body: {
          data: data,
          filename: filename,
          options: options
        }
      });
      
      if (error) throw error;
      
      // Descargar el PDF generado
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = filename;
      link.click();
      
      this.reportProgress(100, 100, 'PDF descargado exitosamente');
    } catch (error) {
      logger.error('Error in large PDF export', error);
      throw new Error('Error al generar PDF en servidor');
    }
  }
  
  private async exportToExcel(options: ExportOptions): Promise<void> {
    const { data, filename, chunkSize = 1000 } = options;
    
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');
    
    if (data.length === 0) return;
    
    // Headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);
    
    this.reportProgress(0, data.length, 'Preparando datos Excel...');
    
    // Procesar en chunks para no bloquear UI
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      
      chunk.forEach(item => {
        const row = headers.map(header => item[header]);
        worksheet.addRow(row);
      });
      
      this.reportProgress(
        Math.min(i + chunkSize, data.length),
        data.length,
        `Procesando registros ${i + 1} - ${Math.min(i + chunkSize, data.length)}...`
      );
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.reportProgress(data.length, data.length, 'Generando archivo Excel...');
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    // Download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(link.href);
    this.reportProgress(data.length, data.length, 'Excel generado exitosamente');
  }
  
  private async exportToCSV(options: ExportOptions): Promise<void> {
    const { data, filename } = options;
    
    if (data.length === 0) return;
    
    this.reportProgress(0, data.length, 'Generando CSV...');
    
    const headers = Object.keys(data[0]);
    let csvContent = headers.join(',') + '\n';
    
    for (let i = 0; i < data.length; i++) {
      const row = headers.map(header => {
        const value = data[i][header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      
      csvContent += row.join(',') + '\n';
      
      if (i % 1000 === 0) {
        this.reportProgress(i, data.length, `Procesando registro ${i + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(link.href);
    this.reportProgress(data.length, data.length, 'CSV generado exitosamente');
  }
}

export const exportService = new ExportService();
