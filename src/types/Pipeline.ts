
export interface Pipeline {
  id: string;
  name: string;
  type: 'OPERACION' | 'PROYECTO' | 'LEAD' | 'TARGET_COMPANY' | 'DEAL' | 'MANDATE';
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface Stage {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  color: string;
  pipeline_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pipeline?: Pipeline;
  // Nuevos campos añadidos para personalización - compatible con Json type
  stage_config?: any;
  required_fields?: string[];
  validation_rules?: any[];
  probability?: number; // Probabilidad de conversión en esta etapa
}

export type PipelineType = Pipeline['type'];
