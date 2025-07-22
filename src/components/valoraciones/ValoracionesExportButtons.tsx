import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

interface ValoracionesExportButtonsProps {
  onExport: (format: 'csv' | 'excel' | 'pdf') => void;
  isExporting: boolean;
  className?: string;
}

export const ValoracionesExportButtons = ({
  onExport,
  isExporting,
  className = ""
}: ValoracionesExportButtonsProps) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport('csv')}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        CSV
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport('excel')}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4" />
        Excel
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport('pdf')}
        disabled={isExporting}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        PDF
      </Button>
    </div>
  );
};