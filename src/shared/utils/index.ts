/**
 * Shared Utilities
 * 
 * Common utility functions used across the application
 */

// Core utilities
export { cn } from '@/lib/utils';
export { logger } from '@/utils/logger';

// Date utilities
export { format, formatDistance, formatRelative } from 'date-fns';
export { es } from 'date-fns/locale';

// Export utilities (commented until utility files are checked)
// export { generateExcelReport } from '@/utils/excelExport';
// export { exportToCSV } from '@/utils/csvExport';
// export { exportToPDF } from '@/utils/pdfExport';

// Validation utilities (commented until utility files are checked)
// export { sanitizeInput } from '@/utils/sanitization';

// Legacy exports for backward compatibility
export * from '@/lib/utils';
export * from '@/utils/logger';
export * from '@/utils/operationHelpers';