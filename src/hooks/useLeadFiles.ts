import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadFile {
  id: string;
  lead_id: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  content_type: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadFileData {
  lead_id: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  content_type?: string;
}

export const useLeadFiles = (leadId: string) => {
  const queryClient = useQueryClient();

  const { data: files = [], isLoading, error, refetch } = useQuery({
    queryKey: ['lead-files', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_files')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadFile[];
    },
    enabled: !!leadId,
  });

  const uploadFile = useMutation({
    mutationFn: async ({ file, leadId }: { file: File; leadId: string }) => {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${leadId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lead-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('lead-files')
        .getPublicUrl(fileName);

      // Save file record to database
      const fileData: CreateLeadFileData = {
        lead_id: leadId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        content_type: file.type,
      };

      const { data, error } = await supabase
        .from('lead_files')
        .insert([{ ...fileData, uploaded_by: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-files', leadId] });
      toast.success('Archivo subido exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al subir el archivo: ${error.message}`);
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (fileId: string) => {
      // First get the file to know the storage path
      const { data: fileData, error: fetchError } = await supabase
        .from('lead_files')
        .select('file_url')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Extract file path from URL
      const urlParts = fileData.file_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${leadId}/${fileName}`;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('lead-files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('lead_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-files', leadId] });
      toast.success('Archivo eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(`Error al eliminar el archivo: ${error.message}`);
    },
  });

  return {
    files,
    isLoading,
    error,
    refetch,
    uploadFile: uploadFile.mutate,
    deleteFile: deleteFile.mutate,
    isUploading: uploadFile.isPending,
    isDeleting: deleteFile.isPending,
  };
};