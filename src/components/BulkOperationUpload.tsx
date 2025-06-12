
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
  const [preview, setPreview] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  
  const { isProcessing, validateExcelData, processBulkUpload } = useBulkOperations();

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setPreview(jsonData.slice(0, 5));
          const validationResult = validateExcelData(jsonData);
          setValidation(validationResult);
          
        } catch (error) {
          console.error('Error processing file:', error);
        }
      };
      
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('Error loading XLSX:', error);
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
        <Button variant="outline" className="border-black text-black hover:bg-gray-100">
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
              className="bg-black text-white hover:bg-gray-800"
            >
              {isProcessing ? 'Procesando...' : 'Importar Operaciones'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
