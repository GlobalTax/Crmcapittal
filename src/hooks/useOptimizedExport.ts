
import { useState, useCallback } from 'react';
import { exportService, ExportOptions, ExportProgress } from '@/services/exportService';
import { logger } from '@/utils/logger';

export function useOptimizedExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    message: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  const startExport = useCallback(async (options: ExportOptions) => {
    try {
      setIsExporting(true);
      setError(null);
      setProgress({
        current: 0,
        total: options.data.length,
        percentage: 0,
        message: 'Iniciando exportación...'
      });
      
      logger.info('Starting export process', {
        format: options.format,
        recordCount: options.data.length,
        filename: options.filename
      });
      
      exportService.setProgressCallback(setProgress);
      await exportService.exportData(options);
      
      logger.info('Export completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      logger.error('Export failed', err);
    } finally {
      setIsExporting(false);
      // Reset progress after 3 seconds
      setTimeout(() => {
        setProgress({
          current: 0,
          total: 0,
          percentage: 0,
          message: ''
        });
      }, 3000);
    }
  }, []);
  
  const cancelExport = useCallback(() => {
    setIsExporting(false);
    setError('Exportación cancelada por el usuario');
    logger.info('Export cancelled by user');
  }, []);
  
  return {
    isExporting,
    progress,
    error,
    startExport,
    cancelExport
  };
}
