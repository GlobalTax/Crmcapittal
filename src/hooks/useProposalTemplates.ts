import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProposalTemplate, CreateTemplateData, UpdateTemplateData } from '@/types/ProposalTemplate';
import { toast } from 'sonner';

export const useProposalTemplates = () => {
  const [templates, setTemplates] = useState<ProposalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('proposal_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (error) throw error;
      
      setTemplates((data || []) as unknown as ProposalTemplate[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar templates';
      setError(errorMessage);
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: CreateTemplateData): Promise<ProposalTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('proposal_templates')
        .insert([{
          ...templateData,
          content_structure: templateData.content_structure as any,
          visual_config: templateData.visual_config as any,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newTemplate = data as unknown as ProposalTemplate;
      setTemplates(prev => [newTemplate, ...prev]);
      toast.success('Template creado exitosamente');
      
      return newTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear template';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error creating template:', err);
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: UpdateTemplateData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('proposal_templates')
        .update({
          ...updates,
          content_structure: updates.content_structure as any,
          visual_config: updates.visual_config as any
        })
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => 
        prev.map(template => 
          template.id === id ? { ...template, ...updates } : template
        )
      );
      toast.success('Template actualizado exitosamente');
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar template';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error updating template:', err);
      return false;
    }
  };

  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('proposal_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(template => template.id !== id));
      toast.success('Template eliminado exitosamente');
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar template';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error deleting template:', err);
      return false;
    }
  };

  const duplicateTemplate = async (template: ProposalTemplate): Promise<ProposalTemplate | null> => {
    const duplicateData: CreateTemplateData = {
      name: `${template.name} (Copia)`,
      description: template.description,
      category: template.category,
      practice_area_id: template.practice_area_id,
      content_structure: template.content_structure,
      visual_config: template.visual_config
    };

    return await createTemplate(duplicateData);
  };

  const incrementUsage = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('proposal_templates')
        .update({ 
          usage_count: templates.find(t => t.id === id)?.usage_count + 1 || 1 
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTemplates(prev => 
        prev.map(template => 
          template.id === id 
            ? { ...template, usage_count: template.usage_count + 1 }
            : template
        )
      );
    } catch (err) {
      console.error('Error incrementing usage:', err);
    }
  };

  const getTemplatesByCategory = (category: ProposalTemplate['category']) => {
    return templates.filter(template => template.category === category);
  };

  const getPopularTemplates = (limit: number = 5) => {
    return templates
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    incrementUsage,
    getTemplatesByCategory,
    getPopularTemplates,
    refetch: fetchTemplates
  };
};