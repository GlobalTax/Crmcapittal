import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, Trash2, Plus, FolderOpen } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Document {
  id: string;
  name: string;
  type: 'nda' | 'teaser' | 'proposal' | 'legal' | 'financial' | 'other';
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
}

interface MandatoDocsProps {
  mandateId: string;
  documents?: Document[];
}

export const MandatoDocs = ({ mandateId, documents = [] }: MandatoDocsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Document['type']>('other');

  // Mock documents for now
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'NDA_EmpresaABC.pdf',
      type: 'nda',
      size: 245760, // 240KB
      uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'Juan Pérez',
      status: 'approved',
      url: '#'
    },
    {
      id: '2',
      name: 'Teaser_Mandato_2024.pdf',
      type: 'teaser',
      size: 1024000, // 1MB
      uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'María García',
      status: 'pending',
      url: '#'
    },
    {
      id: '3',
      name: 'Propuesta_EmpresaXYZ.docx',
      type: 'proposal',
      size: 512000, // 500KB
      uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      uploadedBy: 'Ana López',
      status: 'approved',
      url: '#'
    }
  ];

  const allDocuments = [...mockDocuments, ...documents];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      console.log('Files to upload:', acceptedFiles);
      setIsUploading(false);
    }, 2000);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    const types = {
      nda: 'NDA',
      teaser: 'Teaser',
      proposal: 'Propuesta',
      legal: 'Legal',
      financial: 'Financiero',
      other: 'Otros'
    };
    return types[type];
  };

  const getStatusBadge = (status: Document['status']) => {
    const config = {
      pending: { variant: 'secondary' as const, label: 'Pendiente' },
      approved: { variant: 'default' as const, label: 'Aprobado' },
      rejected: { variant: 'destructive' as const, label: 'Rechazado' },
    };
    
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const groupedDocuments = allDocuments.reduce((acc, doc) => {
    if (!acc[doc.type]) {
      acc[doc.type] = [];
    }
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<Document['type'], Document[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documentos del Mandato</h2>
          <p className="text-muted-foreground">
            Gestiona documentos, NDAs, teasers y propuestas
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            Subir Documentos
          </CardTitle>
          <CardDescription>
            Arrastra archivos aquí o haz clic para seleccionar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Categoría:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Document['type'])}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="nda">NDA</option>
                <option value="teaser">Teaser</option>
                <option value="proposal">Propuesta</option>
                <option value="legal">Legal</option>
                <option value="financial">Financiero</option>
                <option value="other">Otros</option>
              </select>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              {isUploading ? (
                <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
              ) : isDragActive ? (
                <p className="text-sm text-muted-foreground">Suelta los archivos aquí...</p>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Formatos soportados: PDF, DOC, DOCX, XLS, XLSX
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents by Category */}
      <div className="grid grid-cols-1 gap-6">
        {Object.entries(groupedDocuments).map(([type, docs]) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                {getDocumentTypeLabel(type as Document['type'])}
                <Badge variant="outline">{docs.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(doc.size)} • Subido el {formatDate(doc.uploadedAt)} por {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {docs.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hay documentos en esta categoría</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allDocuments.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
              <p className="text-muted-foreground mb-4">
                Comienza subiendo el primer documento del mandato
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Subir Primer Documento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};