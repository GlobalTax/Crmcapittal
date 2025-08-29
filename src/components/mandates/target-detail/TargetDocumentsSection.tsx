import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Plus,
  FileCheck,
  FileSpreadsheet,
  Presentation,
  Shield
} from 'lucide-react';
import { MandateTarget, MandateDocument } from '@/types/BuyingMandate';
import { logger } from '@/utils/productionLogger';

interface TargetDocumentsSectionProps {
  target: MandateTarget;
  documents: MandateDocument[];
  onDocumentUploaded: () => void;
  onGenerateNDA: (targetName: string, contactName: string) => void;
}

export const TargetDocumentsSection = ({ 
  target, 
  documents, 
  onDocumentUploaded,
  onGenerateNDA 
}: TargetDocumentsSectionProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    document_name: '',
    document_type: 'general' as MandateDocument['document_type'],
    is_confidential: false,
    notes: '',
  });

  const getDocumentIcon = (type: MandateDocument['document_type']) => {
    switch (type) {
      case 'nda':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'loi':
        return <FileCheck className="h-4 w-4 text-blue-600" />;
      case 'info_sheet':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'presentation':
        return <Presentation className="h-4 w-4 text-orange-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDocumentTypeText = (type: MandateDocument['document_type']) => {
    const texts = {
      nda: 'NDA',
      loi: 'LOI',
      info_sheet: 'Info Sheet',
      presentation: 'Presentación',
      general: 'General',
      other: 'Otro',
    };
    return texts[type] || type;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleUpload = () => {
    // TODO: Implement file upload logic
    logger.info('Document upload requested', { uploadData }, 'TargetDocumentsSection');
    setIsUploadOpen(false);
    onDocumentUploaded();
  };

  const handleGenerateNDA = () => {
    onGenerateNDA(target.company_name, target.contact_name || 'Representante legal');
  };

  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, MandateDocument[]>);

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos de {target.company_name}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGenerateNDA} variant="outline">
                <FileCheck className="h-4 w-4 mr-2" />
                Generar NDA
              </Button>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Subir Documento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="document_name">Nombre del documento</Label>
                      <Input
                        id="document_name"
                        value={uploadData.document_name}
                        onChange={(e) => setUploadData(prev => ({ ...prev, document_name: e.target.value }))}
                        placeholder="Ej: NDA firmado"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="document_type">Tipo de documento</Label>
                      <Select
                        value={uploadData.document_type}
                        onValueChange={(value) => setUploadData(prev => ({ ...prev, document_type: value as MandateDocument['document_type'] }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nda">NDA</SelectItem>
                          <SelectItem value="loi">LOI</SelectItem>
                          <SelectItem value="info_sheet">Info Sheet</SelectItem>
                          <SelectItem value="presentation">Presentación</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notas (opcional)</Label>
                      <Input
                        id="notes"
                        value={uploadData.notes}
                        onChange={(e) => setUploadData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Comentarios sobre el documento"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_confidential"
                        checked={uploadData.is_confidential}
                        onChange={(e) => setUploadData(prev => ({ ...prev, is_confidential: e.target.checked }))}
                      />
                      <Label htmlFor="is_confidential">Documento confidencial</Label>
                    </div>

                    <Button onClick={handleUpload} className="w-full">
                      Subir Documento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Documents by Type */}
      {Object.keys(documentsByType).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(documentsByType).map(([type, docs]) => (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getDocumentIcon(type as MandateDocument['document_type'])}
                  {getDocumentTypeText(type as MandateDocument['document_type'])}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({docs.length} documento{docs.length > 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(doc.document_type)}
                        <div>
                          <div className="font-medium">{doc.document_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(doc.uploaded_at).toLocaleDateString('es-ES')}
                            {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                            {doc.is_confidential && (
                              <span className="ml-2 inline-flex items-center gap-1 text-red-600">
                                <Shield className="h-3 w-3" />
                                Confidencial
                              </span>
                            )}
                          </div>
                          {doc.notes && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {doc.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Descargar
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">Sin documentos</h3>
            <p className="text-muted-foreground mb-6">
              No hay documentos asociados a {target.company_name}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleGenerateNDA} variant="outline">
                <FileCheck className="h-4 w-4 mr-2" />
                Generar NDA
              </Button>
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Subir Primer Documento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">{documents.length}</div>
          <div className="text-sm text-blue-700">Total documentos</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-900">
            {documents.filter(d => d.document_type === 'nda').length}
          </div>
          <div className="text-sm text-purple-700">NDAs</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-900">
            {documents.filter(d => d.is_confidential).length}
          </div>
          <div className="text-sm text-red-700">Confidenciales</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-900">
            {documents.filter(d => 
              d.document_type === 'loi' || 
              d.document_type === 'info_sheet'
            ).length}
          </div>
          <div className="text-sm text-green-700">Comerciales</div>
        </div>
      </div>
    </div>
  );
};