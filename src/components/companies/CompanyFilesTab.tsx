import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Upload, FileText, Download, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Company } from '@/types/Company';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { logger } from '@/utils/productionLogger';

interface CompanyFilesTabProps {
  company: Company;
}

interface CompanyFile {
  id: string;
  file_name: string;
  file_url: string;
  content_type: string;
  file_size: number;
  created_at: string;
  uploaded_by: string;
}

export const CompanyFilesTab = ({ company }: CompanyFilesTabProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['company-files', company.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_files')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch company files', { error, companyId: company.id });
        throw error;
      }

      return data as CompanyFile[];
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      logger.debug('Starting file upload process', { 
        fileName: file.name, 
        fileSize: file.size, 
        fileType: file.type,
        companyId: company.id
      });

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        logger.error('Authentication error during file upload', { error: userError });
        throw new Error('Error de autenticación');
      }
      if (!userData.user) {
        logger.error('User not authenticated for file upload');
        throw new Error('Usuario no autenticado');
      }

      logger.debug('User authenticated for file upload', { userId: userData.user.id });

      // Upload file to storage with user folder structure
      const fileName = `${userData.user.id}/${Date.now()}-${file.name}`;
      logger.debug('Uploading file to storage', { fileName });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        logger.error('Storage upload failed', { error: uploadError, fileName });
        throw new Error(`Error de storage: ${uploadError.message}`);
      }

      logger.debug('File uploaded to storage successfully', { uploadData });

      // Get public URL - ensure it includes /public/ for public buckets
      const { data: urlData } = supabase.storage
        .from('company-files')
        .getPublicUrl(fileName);

      // Verify the URL is properly formatted for public access
      let publicUrl = urlData.publicUrl;
      if (!publicUrl.includes('/public/')) {
        publicUrl = publicUrl.replace('/object/company-files/', '/object/public/company-files/');
      }

      logger.debug('Generated public URL for file', { publicUrl });

      // Save file record to database
      const fileRecord = {
        company_id: company.id,
        file_name: file.name,
        file_url: publicUrl,
        content_type: file.type,
        file_size: file.size,
        uploaded_by: userData.user.id,
      };

      logger.debug('Saving file record to database', { fileRecord });

      const { data, error } = await supabase
        .from('company_files')
        .insert(fileRecord)
        .select()
        .single();

      if (error) {
        logger.error('Database insert failed for file record', { error, fileRecord });
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      logger.info('File uploaded and saved successfully', { fileId: data.id, fileName: file.name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-files', company.id] });
      toast.success('Archivo subido correctamente');
    },
    onError: (error) => {
      logger.error('File upload operation failed', { error: error.message, companyId: company.id });
      toast.error(`Error al subir el archivo: ${error.message}`);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (file: CompanyFile) => {
      // Extract the correct file path from the URL
      const urlParts = file.file_url.split('/');
      const pathIndex = urlParts.findIndex(part => part === 'company-files');
      
      if (pathIndex !== -1 && pathIndex < urlParts.length - 1) {
        const filePath = urlParts.slice(pathIndex + 1).join('/');
        logger.debug('Attempting to delete file from storage', { filePath, fileId: file.id });
        
        const { error: storageError } = await supabase.storage
          .from('company-files')
          .remove([filePath]);
          
        if (storageError) {
          logger.error('Failed to delete file from storage', { error: storageError, filePath });
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('company_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-files', company.id] });
      toast.success('Archivo eliminado correctamente');
    },
    onError: (error) => {
      logger.error('File deletion operation failed', { error, companyId: company.id });
      toast.error('Error al eliminar el archivo');
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFileMutation.mutate(file);
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
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
          Archivos ({files.length})
        </h3>
        <Button onClick={() => fileInputRef?.click()}>
          <Plus className="h-4 w-4 mr-2" />
          Subir Archivo
        </Button>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-2">
          Arrastra archivos aquí o{' '}
          <button
            onClick={() => fileInputRef?.click()}
            className="text-primary hover:underline"
          >
            haz clic para subir
          </button>
        </p>
        <p className="text-xs text-muted-foreground">
          Formatos soportados: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG
        </p>
      </div>

      <input
        ref={setFileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
      />

      {/* Files List */}
      {files.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay archivos"
          subtitle="Sube archivos relacionados con esta empresa"
        />
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {file.file_name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.file_url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
                              deleteFileMutation.mutate(file);
                            }
                          }}
                          disabled={deleteFileMutation.isPending}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.file_size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeTime(file.created_at)}
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