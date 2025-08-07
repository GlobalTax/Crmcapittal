import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RODTemplate {
  id: string;
  name: string;
  description?: string;
  template_type: string;
  template_data: any;
  is_public: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRODTemplateData {
  name: string;
  description?: string;
  template_type: string;
  template_data: any;
  is_public?: boolean;
}

export function useRODTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const {
    data: templates,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rod-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RODTemplate[];
    }
  });

  // Create template
  const createTemplate = useMutation({
    mutationFn: async (templateData: CreateRODTemplateData) => {
      const { data, error } = await supabase
        .from('rod_templates')
        .insert([{
          ...templateData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-templates'] });
      toast({
        title: "Template creado",
        description: "El template se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Error al crear el template.",
        variant: "destructive",
      });
    }
  });

  // Update template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<RODTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('rod_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-templates'] });
      toast({
        title: "Template actualizado",
        description: "El template se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el template.",
        variant: "destructive",
      });
    }
  });

  // Delete template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rod_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rod-templates'] });
      toast({
        title: "Template eliminado",
        description: "El template se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el template.",
        variant: "destructive",
      });
    }
  });

  // Update usage count
  const incrementUsageCount = useMutation({
    mutationFn: async (id: string) => {
      // Get current template
      const { data: template } = await supabase
        .from('rod_templates')
        .select('usage_count')
        .eq('id', id)
        .single();

      if (template) {
        const { error } = await supabase
          .from('rod_templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', id);

        if (error) throw error;
      }
    }
  });

  return {
    templates,
    isLoading,
    error,
    refetch,
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    incrementUsageCount: incrementUsageCount.mutateAsync,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending
  };
}