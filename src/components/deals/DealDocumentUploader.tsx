import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { DocumentCategory, DOCUMENT_CATEGORIES, DocumentStatus } from '@/types/DealDocument';
import { useDropzone } from 'react-dropzone';

interface DealDocumentUploaderProps {
  onUpload: (file: File, data: {
    document_category: DocumentCategory;
    document_status?: DocumentStatus;
    notes?: string;
  }) => Promise<void>;
  uploading: boolean;
  onClose: () => void;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/msword': ['.doc'],
  'application/vnd.ms-excel': ['.xls']
};

export const DealDocumentUploader = ({ onUpload, uploading, onClose }: DealDocumentUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('other');
  const [status, setStatus] = useState<DocumentStatus>('draft');
  const [notes, setNotes] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
      }
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    await onUpload(selectedFile, {
      document_category: category,
      document_status: status,
      notes: notes.trim() || undefined
    });

    // Reset form
    setSelectedFile(null);
    setCategory('other');
    setStatus('draft');
    setNotes('');
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div>
        <Label>Archivo</Label>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
          `}
        >
          <input {...getInputProps()} />
          
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="font-medium">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(selectedFile.size)} • {selectedFile.type}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOCX, XLSX (máx. 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <Label htmlFor="category">Categoría</Label>
        <Select value={category} onValueChange={(value: DocumentCategory) => setCategory(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DOCUMENT_CATEGORIES).map(([key, { label, icon }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Selection */}
      <div>
        <Label htmlFor="status">Estado</Label>
        <Select value={status} onValueChange={(value: DocumentStatus) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="sent">Enviado</SelectItem>
            <SelectItem value="signed">Firmado</SelectItem>
            <SelectItem value="reviewed">Revisado</SelectItem>
            <SelectItem value="rejected">Rechazado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Añade notas sobre este documento..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleUpload} 
          disabled={!selectedFile || uploading}
          className="min-w-[100px]"
        >
          {uploading ? 'Subiendo...' : 'Subir Documento'}
        </Button>
      </div>
    </div>
  );
};