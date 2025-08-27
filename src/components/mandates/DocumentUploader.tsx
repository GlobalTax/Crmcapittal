import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { FileText, Upload, Eye, Download, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBuyingMandates } from '@/hooks/useBuyingMandates';
import { MandateDocument } from '@/types/BuyingMandate';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/productionLogger';

interface DocumentUploaderProps {
  mandateId: string;
  targetId?: string;
  documents: MandateDocument[];
  onDocumentUploaded: () => void;
}

export const DocumentUploader = ({ mandateId, targetId, documents, onDocumentUploaded }: DocumentUploaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<MandateDocument['document_type']>('general');
  const [notes, setNotes] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const { uploadDocument } = useBuyingMandates();
  const { toast } = useToast();

  const documentTypeLabels = {
    nda: 'NDA',
    loi: 'LOI / Carta de Intención',
    info_sheet: 'Ficha Informativa',
    presentation: 'Presentación',
    general: 'General',
    other: 'Otro',
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${mandateId}/${targetId || 'general'}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('mandate-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('mandate-documents')
        .getPublicUrl(fileName);

      // Save document metadata
      await uploadDocument({
        mandate_id: mandateId,
        target_id: targetId,
        document_name: file.name,
        document_type: documentType,
        file_url: publicUrl,
        file_size: file.size,
        content_type: file.type,
        notes,
        is_confidential: isConfidential,
      });

      // Reset form
      setFile(null);
      setNotes('');
      setIsConfidential(false);
      setDocumentType('general');
      setIsOpen(false);
      onDocumentUploaded();

      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente',
      });
    } catch (error) {
      logger.error('Failed to upload mandate document', { error, mandateId, targetId, fileName: file.name });
      toast({
        title: 'Error',
        description: 'No se pudo subir el documento',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (doc: MandateDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('mandate-documents')
        .download(doc.file_url.split('/').pop() || '');
      
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.document_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Failed to download mandate document', { error, documentName: doc.document_name });
      toast({
        title: 'Error',
        description: 'No se pudo descargar el documento',
        variant: 'destructive',
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Documentos ({documents.length})
        </CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Upload className="h-3 w-3 mr-1" />
              Subir
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Documento</DialogTitle>
              <DialogDescription>
                Sube un documento relacionado con este {targetId ? 'target' : 'mandato'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
                {file && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {file.name} ({formatFileSize(file.size)})
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="documentType">Tipo de Documento</Label>
                <Select value={documentType} onValueChange={(value) => setDocumentType(value as MandateDocument['document_type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descripción o notas sobre el documento..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="confidential"
                  checked={isConfidential}
                  onCheckedChange={setIsConfidential}
                />
                <Label htmlFor="confidential">Documento Confidencial</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpload} disabled={!file || isUploading}>
                  {isUploading ? 'Subiendo...' : 'Subir Documento'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay documentos subidos aún
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium truncate">{doc.document_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {documentTypeLabels[doc.document_type]}
                    </Badge>
                    {doc.is_confidential && (
                      <Badge variant="destructive" className="text-xs">
                        Confidencial
                      </Badge>
                    )}
                  </div>
                  {doc.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{doc.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {doc.file_size && formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(doc.file_url, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(doc)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};