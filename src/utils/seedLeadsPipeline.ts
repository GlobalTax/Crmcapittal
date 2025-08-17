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

// Plantilla simplificada con 5 etapas: Nuevo → Contactado → Cualificado → Ganado/Perdido
const STAGES_DATA: StageData[] = [
  {
    name: 'Nuevo',
    order_index: 1,
    probability: 10,
    color: '#94A3B8',
    description: 'Lead recién captado, pendiente de primera validación',
    checklists: [
      { title: 'Validar contacto', description: 'Verificar email y teléfono válidos', is_required: true, order_index: 1 },
      { title: 'Identificar empresa', description: 'Confirmar nombre y sector de la empresa', is_required: true, order_index: 2 }
    ]
  },
  {
    name: 'Contactado',
    order_index: 2,
    probability: 30,
    color: '#3B82F6',
    description: 'Primer contacto establecido con el lead',
    checklists: [
      { title: 'Primera llamada', description: 'Realizar y documentar primer contacto', is_required: true, order_index: 1 },
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
    probability: 60,
    color: '#F59E0B',
    description: 'Lead cualificado con interés y presupuesto confirmados',
    checklists: [
      { title: 'Confirmar presupuesto', description: 'Validar rango de presupuesto disponible', is_required: true, order_index: 1 },
      { title: 'Identificar decision maker', description: 'Confirmar quién toma las decisiones', is_required: true, order_index: 2 },
      { title: 'Preparar propuesta', description: 'Elaborar propuesta o presentación', is_required: true, order_index: 3 }
    ]
  },
  {
    name: 'Ganado',
    order_index: 4,
    probability: 100,
    color: '#10B981',
    description: 'Lead convertido exitosamente en cliente',
    checklists: [
      { title: 'Cerrar deal', description: 'Finalizar negociación y firmar contrato', is_required: true, order_index: 1 },
      { title: 'Programar kick-off', description: 'Planificar inicio del proyecto/servicio', is_required: true, order_index: 2 }
    ]
  },
  {
    name: 'Perdido',
    order_index: 5,
    probability: 0,
    color: '#6B7280',
    description: 'Lead no convertido - documentar para futuro seguimiento',
    checklists: [
      { title: 'Registrar motivo', description: 'Documentar razón por la cual se perdió el lead', is_required: true, order_index: 1 },
      { title: 'Programar recontacto', description: 'Establecer fecha para recontacto futuro si aplica', is_required: false, order_index: 2 }
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
        description: 'Pipeline simplificado para gestión de leads con 5 etapas optimizadas (Nuevo → Contactado → Cualificado → Ganado/Perdido)',
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