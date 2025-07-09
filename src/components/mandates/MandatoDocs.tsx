import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { DocumentItem } from './DocumentItem';
import { useMandateDocuments } from '@/hooks/useMandateDocuments';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { MANDATE_DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/types/MandateDocument';
import { toast } from 'sonner';

interface MandatoDocsProps {
  mandateId: string;
}

export const MandatoDocs = ({ mandateId }: MandatoDocsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('other');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    documents,
    loading,
    uploading,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    getDocumentsByType,
    getDocumentCounts
  } = useMandateDocuments(mandateId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo primero');
      return;
    }

    const result = await uploadDocument(selectedFile, {
      mandate_id: mandateId,
      document_type: documentType,
      notes: notes.trim() || undefined,
    });

    if (result) {
      // Reset form
      setSelectedFile(null);
      setDocumentType('other');
      setNotes('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      await deleteDocument(documentId);
    }
  };

  const documentCounts = getDocumentCounts();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentación del Mandato</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentación del Mandato
          {documents.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({documents.length} documento{documents.length !== 1 ? 's' : ''})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Form */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium">Subir nuevo documento</h4>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="fileUpload">Archivo</Label>
              <Input 
                ref={fileInputRef}
                id="fileUpload" 
                type="file" 
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              />
              {selectedFile && (
                <p className="text-xs text-muted-foreground">
                  Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {MANDATE_DOCUMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Descripción o comentarios sobre el documento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir documento
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Aún no se han subido documentos para este mandato.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {MANDATE_DOCUMENT_TYPES.map(type => {
              const typeDocs = getDocumentsByType(type);
              if (typeDocs.length === 0) return null;
              
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {DOCUMENT_TYPE_LABELS[type]}
                    </h4>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {typeDocs.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {typeDocs.map(doc => (
                      <DocumentItem
                        key={doc.id}
                        document={doc}
                        onDownload={downloadDocument}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};