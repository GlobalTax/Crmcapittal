import { supabase } from '@/integrations/supabase/client';
import { PipelineType } from '@/types/Pipeline';

interface StageData {
  name: string;
  order_index: number;
  probability: number;
  color: string;
  description: string;
  checklists: Array<{
    title: string;
    description: string;
    is_required: boolean;
    order_index: number;
  }>;
  actions?: Array<{
    action_type: 'automatic' | 'manual';
    action_name: string;
    action_config: any;
    is_required: boolean;
    order_index: number;
  }>;
}

const STAGES_DATA: StageData[] = [
  {
    name: 'Nuevo',
    order_index: 1,
    probability: 10,
    color: '#94A3B8',
    description: 'Lead recién captado, pendiente de primera validación',
    checklists: [
      { title: 'Validar email', description: 'Verificar que el email es válido y activo', is_required: true, order_index: 1 },
      { title: 'Identificar empresa', description: 'Confirmar nombre y sector de la empresa', is_required: true, order_index: 2 },
      { title: 'Obtener teléfono', description: 'Conseguir número de contacto directo', is_required: false, order_index: 3 }
    ]
  },
  {
    name: 'Contactado',
    order_index: 2,
    probability: 25,
    color: '#3B82F6',
    description: 'Primer contacto establecido con el lead',
    checklists: [
      { title: 'Registrar primera llamada', description: 'Documentar resultado del primer contacto', is_required: true, order_index: 1 },
      { title: 'Programar seguimiento', description: 'Establecer fecha para próxima interacción', is_required: true, order_index: 2 }
    ],
    actions: [
      {
        action_type: 'automatic',
        action_name: 'Crear tarea de seguimiento',
        action_config: {
          task_type: 'call',
          task_description: 'Llamar al lead para dar seguimiento',
          delay_minutes: 2880 // 2 días
        },
        is_required: false,
        order_index: 1
      }
    ]
  },
  {
    name: 'Cualificado',
    order_index: 3,
    probability: 40,
    color: '#F59E0B',
    description: 'Lead cualificado con interés confirmado',
    checklists: [
      { title: 'Capturar presupuesto', description: 'Obtener rango de presupuesto disponible', is_required: true, order_index: 1 },
      { title: 'Identificar decision maker', description: 'Confirmar quién toma las decisiones', is_required: true, order_index: 2 },
      { title: 'Validar timeline', description: 'Establecer timeline de decisión', is_required: false, order_index: 3 }
    ],
    actions: [
      {
        action_type: 'automatic',
        action_name: 'Crear tarea preparar propuesta',
        action_config: {
          task_type: 'preparation',
          task_description: 'Preparar propuesta personalizada para el lead',
          delay_minutes: 1440 // 1 día
        },
        is_required: false,
        order_index: 1
      }
    ]
  },
  {
    name: 'Propuesta',
    order_index: 4,
    probability: 65,
    color: '#8B5CF6',
    description: 'Propuesta enviada al cliente',
    checklists: [
      { title: 'Enviar propuesta', description: 'Remitir propuesta formal por email', is_required: true, order_index: 1 },
      { title: 'Confirmar recepción', description: 'Verificar que recibió y revisó la propuesta', is_required: true, order_index: 2 },
      { title: 'Programar presentación', description: 'Agendar reunión para presentar propuesta', is_required: false, order_index: 3 }
    ],
    actions: [
      {
        action_type: 'automatic',
        action_name: 'Follow-up propuesta',
        action_config: {
          task_type: 'follow_up',
          task_description: 'Hacer seguimiento de la propuesta enviada',
          delay_minutes: 10080 // 1 semana
        },
        is_required: false,
        order_index: 1
      }
    ]
  },
  {
    name: 'Negociación',
    order_index: 5,
    probability: 80,
    color: '#EF4444',
    description: 'En proceso de negociación de términos',
    checklists: [
      { title: 'Registrar feedback', description: 'Documentar comentarios y objeciones', is_required: true, order_index: 1 },
      { title: 'Negociar términos', description: 'Ajustar condiciones según feedback', is_required: true, order_index: 2 },
      { title: 'Obtener aprobaciones', description: 'Conseguir aprobaciones internas necesarias', is_required: false, order_index: 3 }
    ]
  },
  {
    name: 'Ganado',
    order_index: 6,
    probability: 100,
    color: '#10B981',
    description: 'Lead convertido exitosamente',
    checklists: [
      { title: 'Firmar contrato', description: 'Formalizar acuerdo con firma de contrato', is_required: true, order_index: 1 },
      { title: 'Programar kick-off', description: 'Planificar inicio del proyecto/servicio', is_required: true, order_index: 2 }
    ]
  },
  {
    name: 'Perdido',
    order_index: 7,
    probability: 0,
    color: '#6B7280',
    description: 'Lead no convertido',
    checklists: [
      { title: 'Registrar motivo', description: 'Documentar razón por la cual se perdió', is_required: true, order_index: 1 },
      { title: 'Programar follow-up futuro', description: 'Establecer fecha para recontacto futuro', is_required: false, order_index: 2 }
    ]
  }
];

export async function checkIfLeadsPipelineExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('pipelines')
      .select('id')
      .eq('type', 'LEAD')
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error checking existing pipelines:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkIfLeadsPipelineExists:', error);
    return false;
  }
}

export async function seedLeadsPipeline(): Promise<{ success: boolean; message: string; pipelineId?: string }> {
  try {
    console.log('🌱 Iniciando seeding del pipeline de leads...');

    // Verificar si ya existe un pipeline de leads
    const exists = await checkIfLeadsPipelineExists();
    if (exists) {
      return {
        success: false,
        message: 'Ya existe un pipeline de leads activo'
      };
    }

    // Crear el pipeline principal
    const { data: pipeline, error: pipelineError } = await supabase
      .from('pipelines')
      .insert({
        name: 'Pipeline de Leads por Defecto',
        type: 'LEAD' as PipelineType,
        description: 'Pipeline estándar para gestión de leads con 7 etapas optimizadas para conversión',
        is_active: true
      })
      .select('id')
      .single();

    if (pipelineError || !pipeline) {
      console.error('Error creating pipeline:', pipelineError);
      return {
        success: false,
        message: 'Error al crear el pipeline: ' + pipelineError?.message
      };
    }

    console.log('✅ Pipeline creado con ID:', pipeline.id);

    // Crear etapas, checklists y acciones
    for (const stageData of STAGES_DATA) {
      console.log(`📊 Creando etapa: ${stageData.name}`);

      // Crear la etapa
      const { data: stage, error: stageError } = await supabase
        .from('stages')
        .insert({
          name: stageData.name,
          description: stageData.description,
          order_index: stageData.order_index,
          color: stageData.color,
          pipeline_id: pipeline.id,
          is_active: true,
          probability: stageData.probability
        })
        .select('id')
        .single();

      if (stageError || !stage) {
        console.error(`Error creating stage ${stageData.name}:`, stageError);
        continue;
      }

      // Crear checklists para esta etapa
      if (stageData.checklists && stageData.checklists.length > 0) {
        const checklistItems = stageData.checklists.map(checklist => ({
          stage_id: stage.id,
          title: checklist.title,
          description: checklist.description,
          is_required: checklist.is_required,
          order_index: checklist.order_index,
          is_active: true
        }));

        const { error: checklistError } = await (supabase as any)
          .from('stage_checklists')
          .insert(checklistItems);

        if (checklistError) {
          console.error(`Error creating checklists for ${stageData.name}:`, checklistError);
        } else {
          console.log(`  ✅ ${checklistItems.length} checklist items creados`);
        }
      }

      // Crear acciones automáticas para esta etapa
      if (stageData.actions && stageData.actions.length > 0) {
        const stageActions = stageData.actions.map(action => ({
          stage_id: stage.id,
          action_type: action.action_type,
          action_name: action.action_name,
          action_config: action.action_config,
          is_required: action.is_required,
          order_index: action.order_index,
          is_active: true
        }));

        const { error: actionError } = await (supabase as any)
          .from('stage_actions')
          .insert(stageActions);

        if (actionError) {
          console.error(`Error creating actions for ${stageData.name}:`, actionError);
        } else {
          console.log(`  ✅ ${stageActions.length} acciones automáticas creadas`);
        }
      }
    }

    console.log('🎉 Pipeline de leads creado exitosamente!');
    
    return {
      success: true,
      message: `Pipeline de leads creado exitosamente con ${STAGES_DATA.length} etapas`,
      pipelineId: pipeline.id
    };

  } catch (error) {
    console.error('Error in seedLeadsPipeline:', error);
    return {
      success: false,
      message: 'Error inesperado: ' + (error as Error).message
    };
  }
}

export async function createSampleLeadsPipeline(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await seedLeadsPipeline();
    return result;
  } catch (error) {
    console.error('Error in createSampleLeadsPipeline:', error);
    return {
      success: false,
      message: 'Error al crear pipeline de muestra: ' + (error as Error).message
    };
  }
}