
import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logger } from '@/utils/logger';

interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  data: Record<string, any>[];
  filename: string;
  includeHeaders?: boolean;
  customStyles?: any;
}

export function useOptimizedExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const cancelExport = useCallback(() => {
    if (isExporting) {
      setIsExporting(false);
      setProgress(0);
      logger.info('Export operation cancelled by user');
    }
  }, [isExporting]);

  const startExport = useCallback(async (options: ExportOptions) => {
    const { format, data, filename, includeHeaders = true } = options;

    if (!data || data.length === 0) {
      logger.warn('No data to export');
      return;
    }

    try {
      setIsExporting(true);
      setProgress(0);
      setError(null);

      // Preparar encabezados si es necesario
      const headers = includeHeaders ? Object.keys(data[0]) : [];
      
      // Determinar el tamaño de los bloques basado en el volumen de datos
      const totalItems = data.length;
      const chunkSize = Math.min(
        Math.max(10, Math.floor(totalItems / 10)), // Al menos 10 elementos, máximo 1/10 del total
        200 // No más de 200 elementos por bloque
      );
      
      logger.debug(`Starting ${format} export with ${totalItems} items`);

      switch (format) {
        case 'csv': {
          await exportToCsv(data, headers, filename, chunkSize);
          break;
        }
        case 'excel': {
          await exportToExcel(data, headers, filename, chunkSize);
          break;
        }
        case 'pdf': {
          await exportToPdf(data, headers, filename, chunkSize);
          break;
        }
        default:
          throw new Error(`Formato de exportación no soportado: ${format}`);
      }

      logger.info(`Export completed: ${filename}`);
    } catch (err) {
      logger.error('Export failed:', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsExporting(false);
      setProgress(100);
      
      // Reiniciar el progreso después de un tiempo
      setTimeout(() => {
        setProgress(0);
      }, 3000);
    }
  }, []);

  // Exportar a CSV
  const exportToCsv = async (
    data: Record<string, any>[], 
    headers: string[], 
    filename: string,
    chunkSize: number
  ) => {
    let csvContent = '';
    
    // Añadir encabezados
    if (headers.length > 0) {
      csvContent += headers.join(',') + '\n';
    }
    
    // Procesar los datos en bloques
    for (let i = 0; i < data.length; i += chunkSize) {
      if (!isExporting) break; // Permitir cancelación
      
      const chunk = data.slice(i, i + chunkSize);
      
      // Añadir filas
      chunk.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Escapar comas y comillas
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        });
        csvContent += values.join(',') + '\n';
      });
      
      // Actualizar progreso
      setProgress(Math.min(100, Math.round((i + chunk.length) / data.length * 100)));
      
      // Permitir que la UI se actualice
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
  };

  // Exportar a Excel
  const exportToExcel = async (
    data: Record<string, any>[], 
    headers: string[], 
    filename: string,
    chunkSize: number
  ) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Datos');
    
    // Añadir encabezados
    if (headers.length > 0) {
      worksheet.addRow(headers);
    }
    
    // Procesar los datos en bloques
    for (let i = 0; i < data.length; i += chunkSize) {
      if (!isExporting) break; // Permitir cancelación
      
      const chunk = data.slice(i, i + chunkSize);
      
      // Añadir filas
      chunk.forEach(row => {
        const values = headers.map(header => row[header]);
        worksheet.addRow(values);
      });
      
      // Actualizar progreso
      setProgress(Math.min(100, Math.round((i + chunk.length) / data.length * 100)));
      
      // Permitir que la UI se actualice
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Crear y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, filename);
  };

  // Exportar a PDF
  const exportToPdf = async (
    data: Record<string, any>[], 
    headers: string[], 
    filename: string,
    chunkSize: number
  ) => {
    const doc = new jsPDF();
    
    // Formatear datos para jsPDF-AutoTable
    const tableData: string[][] = [];
    const tableHeaders = headers.map(header => header);
    
    // Procesar los datos en bloques
    for (let i = 0; i < data.length; i += chunkSize) {
      if (!isExporting) break; // Permitir cancelación
      
      const chunk = data.slice(i, i + chunkSize);
      
      // Añadir filas
      chunk.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          return value !== null && value !== undefined ? String(value) : '';
        });
        tableData.push(values);
      });
      
      // Actualizar progreso
      setProgress(Math.min(100, Math.round((i + chunk.length) / data.length * 100)));
      
      // Permitir que la UI se actualice
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Generar la tabla
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      margin: { top: 20 },
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    // Guardar el archivo
    doc.save(filename);
  };

  return {
    isExporting,
    progress,
    error,
    startExport,
    cancelExport
  };
}
