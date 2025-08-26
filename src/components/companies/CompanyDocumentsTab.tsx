import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Download, Trash2, Plus, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Company } from '@/types/Company';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface CompanyDocumentsTabProps {
  company: Company;
}

interface CompanyDocument {
  id: string;
  file_name: string;
  file_url: string;
  content_type: string;
  file_size: number;
  document_category: string;
  document_status: string;
  notes?: string;
  created_at: string;
  uploaded_by: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'contract', label: 'Contrato' },
  { value: 'proposal', label: 'Propuesta' },
  { value: 'invoice', label: 'Factura' },
  { value: 'presentation', label: 'Presentación' },
  { value: 'legal', label: 'Legal' },
  { value: 'financial', label: 'Financiero' },
  { value: 'other', label: 'Otros' },
];

export const CompanyDocumentsTab = ({ company }: CompanyDocumentsTabProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('contract');
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['company-documents', company.id],
    queryFn: async () => {
      // Using company_files table for now as we don't have a dedicated documents table
      const { data, error } = await supabase
        .from('company_files')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Error fetching company documents
        throw error;
      }

      return data.map(file => ({
        ...file,
        document_category: 'other',
        document_status: 'active',
      })) as CompanyDocument[];
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      // Iniciando subida de documento

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        // Error obteniendo usuario
        throw new Error('Error de autenticación');
      }
      if (!userData.user) {
        // No hay usuario autenticado
        throw new Error('Usuario no autenticado');
      }

      // Usuario autenticado

      // Upload file to storage with user folder structure
      const fileName = `${userData.user.id}/${Date.now()}-${file.name}`;
      // Subiendo documento como

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Error al subir documento al storage
        throw new Error(`Error de storage: ${uploadError.message}`);
      }

      // Documento subido al storage

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('company-files')
        .getPublicUrl(fileName);

      // URL pública generada

      // Save document record to database
      const documentRecord = {
        company_id: company.id,
        file_name: file.name,
        file_url: urlData.publicUrl,
        content_type: file.type,
        file_size: file.size,
        uploaded_by: userData.user.id,
      };

      // Guardando registro en BD

      const { data, error } = await supabase
        .from('company_files')
        .insert(documentRecord)
        .select()
        .single();

      if (error) {
        // Error al guardar en BD
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      // Documento guardado exitosamente
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-documents', company.id] });
      toast.success('Documento subido correctamente');
    },
    onError: (error) => {
      toast.error(`Error al subir el documento: ${error.message}`);
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (document: CompanyDocument) => {
      // Delete from storage
      const fileName = document.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('company-files')
          .remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from('company_files')
        .delete()
        .eq('id', document.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-documents', company.id] });
      toast.success('Documento eliminado correctamente');
    },
    onError: (error) => {
      toast.error('Error al eliminar el documento');
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocumentMutation.mutate(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadDocumentMutation.mutate(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRelativeTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: es
    });
  };

  const getCategoryLabel = (category: string) => {
    return DOCUMENT_CATEGORIES.find(cat => cat.value === category)?.label || 'Otros';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Documentos ({documents.length})
        </h3>
        <Button onClick={() => fileInputRef?.click()}>
          <Plus className="h-4 w-4 mr-2" />
          Subir Documento
        </Button>
      </div>

      {/* Document Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Arrastra documentos aquí o{' '}
          <button
            onClick={() => fileInputRef?.click()}
            className="text-primary hover:underline"
          >
            haz clic para subir
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Documentos: PDF, DOC, DOCX, XLS, XLSX
        </p>
      </div>

      <input
        ref={setFileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
      />

      {/* Documents List */}
      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay documentos"
          subtitle="Sube documentos importantes relacionados con esta empresa"
        />
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {document.file_name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(document.document_category)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(document.file_url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                              deleteDocumentMutation.mutate(document);
                            }
                          }}
                          disabled={deleteDocumentMutation.isPending}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.file_size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(document.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};