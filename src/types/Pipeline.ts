
export interface Pipeline {
  id: string;
  name: string;
  type: 'OPERACION' | 'PROYECTO' | 'LEAD' | 'TARGET_COMPANY';
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
}

export type PipelineType = Pipeline['type'];
