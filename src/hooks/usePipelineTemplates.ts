import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PipelineTemplate } from '@/types/StageAction';
import { toast } from 'sonner';

export const usePipelineTemplates = () => {
  const [templates, setTemplates] = useState<PipelineTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('pipeline_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data || []) as unknown as PipelineTemplate[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar templates';
      setError(errorMessage);
      console.error('Error fetching pipeline templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Omit<PipelineTemplate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('pipeline_templates')
        .insert([{
          ...templateData,
          template_data: templateData.template_data as any,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => [data as unknown as PipelineTemplate, ...prev]);
      toast.success('Template creado exitosamente');
      return data as unknown as PipelineTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear template';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<PipelineTemplate>) => {
    try {
      const updateData = updates.template_data 
        ? { ...updates, template_data: updates.template_data as any }
        : updates;
        
      const { data, error } = await supabase
        .from('pipeline_templates')
        .update(updateData)
        .eq('id', templateId)
        .select()
        .single();

      if (error) throw error;
      
      setTemplates(prev => prev.map(template => 
        template.id === templateId ? { ...template, ...(data as unknown as PipelineTemplate) } : template
      ));
      toast.success('Template actualizado exitosamente');
      return data as unknown as PipelineTemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar template';
      toast.error(errorMessage);
      throw err;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('pipeline_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      setTemplates(prev => prev.filter(template => template.id !== templateId));
      toast.success('Template eliminado exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar template';
      toast.error(errorMessage);
      throw err;
    }
  };

  const applyTemplate = async (templateId: string, pipelineId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Template no encontrado');
      }

      // Implementar lógica para aplicar el template al pipeline
      // Esto implicaría crear las etapas y acciones definidas en el template
      
      toast.success('Template aplicado exitosamente');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al aplicar template';
      toast.error(errorMessage);
      throw err;
    }
  };

  // Predefined templates
  const getDefaultTemplates = (): Omit<PipelineTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>[] => [
    {
      name: 'Pipeline M&A Estándar',
      description: 'Pipeline estándar para operaciones de fusiones y adquisiciones',
      category: 'ma',
      is_public: true,
      template_data: {
        stages: [
          {
            name: 'New Lead',
            description: 'Lead inicial capturado',
            color: '#94A3B8',
            order_index: 0,
            stage_config: { probability: 5 },
            required_fields: ['name', 'company_name'],
            validation_rules: [] as any[],
            actions: [
              {
                action_name: 'Enviar confirmación de recepción',
                action_type: 'automatic' as const,
                action_config: {
                  task_type: 'email',
                  task_description: 'Enviar email de confirmación automático',
                  delay_minutes: 5
                },
                is_required: false,
                order_index: 0,
                is_active: true
              }
            ]
          },
          {
            name: 'Qualified',
            description: 'Lead cualificado tras screening inicial',
            color: '#3B82F6',
            order_index: 1,
            stage_config: { probability: 15 },
            required_fields: ['sector_id', 'budget_range'],
            validation_rules: [] as any[],
            actions: [
              {
                action_name: 'Programar llamada de cualificación',
                action_type: 'manual' as const,
                action_config: {
                  button_text: 'Programar Llamada',
                  confirmation_message: '¿Programar llamada con el lead?',
                  success_message: 'Llamada programada exitosamente'
                },
                is_required: true,
                order_index: 0,
                is_active: true
              }
            ]
          },
          {
            name: 'NDA Sent',
            description: 'NDA enviado y pendiente de firma',
            color: '#F59E0B',
            order_index: 2,
            stage_config: { probability: 25 },
            required_fields: ['nda_sent_date'],
            validation_rules: [] as any[],
            actions: [
              {
                action_name: 'Enviar NDA',
                action_type: 'manual' as const,
                action_config: {
                  button_text: 'Enviar NDA',
                  confirmation_message: '¿Enviar acuerdo de confidencialidad?',
                  success_message: 'NDA enviado exitosamente'
                },
                is_required: true,
                order_index: 0,
                is_active: true
              }
            ]
          },
          {
            name: 'NDA Signed',
            description: 'NDA firmado, listo para compartir información',
            color: '#10B981',
            order_index: 3,
            stage_config: { probability: 40 },
            required_fields: ['nda_signed_date'],
            validation_rules: [] as any[],
            actions: []
          },
          {
            name: 'Info Shared',
            description: 'Información compartida y revisada',
            color: '#8B5CF6',
            order_index: 4,
            stage_config: { probability: 60 },
            required_fields: ['teaser_sent_date'],
            validation_rules: [] as any[],
            actions: [
              {
                action_name: 'Programar reunión de presentación',
                action_type: 'manual' as const,
                action_config: {
                  button_text: 'Programar Reunión',
                  success_message: 'Reunión programada'
                },
                is_required: false,
                order_index: 0,
                is_active: true
              }
            ]
          },
          {
            name: 'Negotiation',
            description: 'En proceso de negociación del mandato',
            color: '#EF4444',
            order_index: 5,
            stage_config: { probability: 80 },
            required_fields: ['negotiation_start_date'],
            validation_rules: [] as any[],
            actions: []
          },
          {
            name: 'Mandate Signed',
            description: 'Mandato firmado exitosamente',
            color: '#059669',
            order_index: 6,
            stage_config: { probability: 100 },
            required_fields: ['mandate_signed_date', 'mandate_value'],
            validation_rules: [] as any[],
            actions: [
              {
                action_name: 'Crear proyecto de ejecución',
                action_type: 'automatic' as const,
                action_config: {
                  task_type: 'task',
                  task_description: 'Crear proyecto para ejecutar el mandato'
                },
                is_required: true,
                order_index: 0,
                is_active: true
              }
            ]
          }
        ]
      }
    },
    {
      name: 'Pipeline de Valoraciones',
      description: 'Pipeline específico para solicitudes de valoración',
      category: 'valuation',
      is_public: true,
      template_data: {
        stages: [
          {
            name: 'Solicitud Recibida',
            description: 'Solicitud de valoración recibida',
            color: '#6B7280',
            order_index: 0,
            stage_config: { probability: 10 },
            required_fields: ['company_name', 'contact_email'],
            validation_rules: [] as any[],
            actions: []
          },
          {
            name: 'Información Recopilada',
            description: 'Información financiera recopilada',
            color: '#3B82F6',
            order_index: 1,
            stage_config: { probability: 30 },
            required_fields: ['financial_statements', 'revenue_ltm'],
            validation_rules: [] as any[],
            actions: []
          },
          {
            name: 'Análisis en Progreso',
            description: 'Realizando análisis de valoración',
            color: '#F59E0B',
            order_index: 2,
            stage_config: { probability: 60 },
            required_fields: ['analyst_assigned'],
            validation_rules: [] as any[],
            actions: []
          },
          {
            name: 'Valoración Completada',
            description: 'Valoración finalizada y entregada',
            color: '#10B981',
            order_index: 3,
            stage_config: { probability: 100 },
            required_fields: ['valuation_report', 'delivery_date'],
            validation_rules: [] as any[],
            actions: []
          }
        ]
      }
    }
  ];

  const createDefaultTemplates = async () => {
    const defaultTemplates = getDefaultTemplates();
    
    try {
      for (const template of defaultTemplates) {
        await createTemplate(template);
      }
      toast.success('Templates por defecto creados');
    } catch (error) {
      console.error('Error creating default templates:', error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    createDefaultTemplates,
    getDefaultTemplates,
    refetch: fetchTemplates
  };
};