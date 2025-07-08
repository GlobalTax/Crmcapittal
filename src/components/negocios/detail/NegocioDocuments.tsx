import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Eye, Trash2, Plus } from 'lucide-react';
import { Negocio } from '@/types/Negocio';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NegocioDocumentsProps {
  negocio: Negocio;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  status: 'draft' | 'final' | 'shared';
}

const documentTypes = [
  { value: 'nda', label: 'NDA' },
  { value: 'loi', label: 'LOI (Letter of Intent)' },
  { value: 'financial', label: 'Estados Financieros' },
  { value: 'teaser', label: 'Teaser' },
  { value: 'info_memo', label: 'Information Memorandum' },
  { value: 'due_diligence', label: 'Due Diligence' },
  { value: 'valuation', label: 'Valoración' },
  { value: 'contract', label: 'Contrato' },
  { value: 'other', label: 'Otro' }
];

// Mock data - in real implementation, this would come from a database
const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'NDA_Empresa_Ejemplo.pdf',
    type: 'nda',
    size: '245 KB',
    uploadDate: '2024-01-15',
    uploadedBy: 'Juan Pérez',
    status: 'final'
  },
  {
    id: '2',
    name: 'Teaser_Comercial.pdf',
    type: 'teaser',
    size: '1.2 MB',
    uploadDate: '2024-01-10',
    uploadedBy: 'María García',
    status: 'shared'
  }
];

export const NegocioDocuments = ({ negocio }: NegocioDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    file: null as File | null
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-green-100 text-green-800';
      case 'shared': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'final': return 'Final';
      case 'shared': return 'Compartido';
      default: return 'Desconocido';
    }
  };

  const getTypeLabel = (type: string) => {
    const docType = documentTypes.find(t => t.value === type);
    return docType ? docType.label : type;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm({ ...uploadForm, file, name: file.name });
    }
  };

  const handleUploadSubmit = () => {
    if (uploadForm.file && uploadForm.type) {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: uploadForm.name || uploadForm.file.name,
        type: uploadForm.type,
        size: `${Math.round(uploadForm.file.size / 1024)} KB`,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Usuario Actual',
        status: 'draft'
      };
      
      setDocuments([...documents, newDocument]);
      setUploadForm({ name: '', type: '', file: null });
      setShowUploadDialog(false);
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión Documental
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Subir Nuevo Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-name">Nombre del Documento</Label>
                  <Input
                    id="document-name"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                    placeholder="Nombre del documento"
                  />
                </div>
                <div>
                  <Label htmlFor="document-type">Tipo de Documento</Label>
                  <Select value={uploadForm.type} onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="document-file">Archivo</Label>
                  <Input
                    id="document-file"
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUploadSubmit} disabled={!uploadForm.file || !uploadForm.type}>
                    Subir Documento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Tamaño</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-sm text-gray-500">por {doc.uploadedBy}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(doc.type)}</Badge>
                  </TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusLabel(doc.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteDocument(doc.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No hay documentos</h3>
            <p className="text-sm mb-4">Sube documentos relacionados con este negocio</p>
          </div>
        )}
      </CardContent>
    </Card>
  );};
