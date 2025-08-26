
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Operation } from '@/types/Operation';
import { TemplateDownloader } from './TemplateDownloader';
import { FileUploader } from './FileUploader';
import { ValidationResults } from './ValidationResults';
import { DataPreview } from './DataPreview';
import { useBulkOperations } from '@/hooks/useBulkOperations';

interface BulkOperationUploadProps {
  onBulkAdd: (operations: Omit<Operation, "id" | "created_at" | "updated_at" | "created_by">[]) => Promise<{ error?: string }>;
}

export const BulkOperationUpload = ({ onBulkAdd }: BulkOperationUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[]; warnings: string[] } | null>(null);
  
  const { isProcessing, validateExcelData, processBulkUpload } = useBulkOperations();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    
    try {
      const ExcelJS = await import('exceljs');
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);
          const worksheet = workbook.getWorksheet(1);
          const jsonData: Record<string, unknown>[] = [];
          
          if (worksheet) {
            const headers: string[] = [];
            
            // Get headers from first row
            worksheet.getRow(1).eachCell((cell, colNumber) => {
              headers[colNumber - 1] = cell.value?.toString() || '';
            });
            
            // Process data rows
            worksheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) return; // Skip header row
              
              const rowData: Record<string, unknown> = {};
              row.eachCell((cell, colNumber) => {
                const header = headers[colNumber - 1];
                if (header) {
                  rowData[header] = cell.value;
                }
              });
              
              // Only add rows with data
              if (Object.keys(rowData).length > 0) {
                jsonData.push(rowData);
              }
            });
          }
          
          setPreview(jsonData.slice(0, 5));
          const validationResult = validateExcelData(jsonData);
          setValidation(validationResult);
          
        } catch (error) {
          // Error processing file
        }
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      // Error loading ExcelJS
    }
  };

  const handleUpload = async () => {
    if (!file || !validation?.valid) return;

    const result = await processBulkUpload(file, onBulkAdd);
    
    if (result.success) {
      setIsOpen(false);
      setFile(null);
      setPreview([]);
      setValidation(null);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setPreview([]);
    setValidation(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Subida Masiva
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subida Masiva de Operaciones</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <TemplateDownloader />
          <FileUploader onFileSelect={handleFileSelect} />
          <ValidationResults validation={validation} />
          {preview.length > 0 && <DataPreview data={preview} />}

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!validation?.valid || isProcessing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isProcessing ? 'Procesando...' : 'Importar Operaciones'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
