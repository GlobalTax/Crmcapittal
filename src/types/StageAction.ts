export interface StageAction {
  id: string;
  stage_id: string;
  action_type: 'automatic' | 'manual' | 'validation';
  action_name: string;
  action_config: ActionConfig;
  is_required: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ActionConfig {
  // Para acciones automáticas
  email_template_id?: string;
  notification_message?: string;
  task_type?: string;
  task_description?: string;
  
  // Para acciones manuales
  button_text?: string;
  button_color?: string;
  confirmation_message?: string;
  success_message?: string;
  
  // Para validaciones
  required_fields?: string[];
  validation_rules?: ValidationRule[];
  error_message?: string;
  
  // Para todas las acciones
  conditions?: ActionCondition[];
  delay_minutes?: number;
  depends_on?: string[]; // IDs de otras acciones
}

export interface ValidationRule {
  field: string;
  rule_type: 'required' | 'min_length' | 'max_length' | 'email' | 'phone' | 'custom';
  value?: any;
  custom_function?: string;
  error_message?: string;
}

export interface ActionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
}

export interface PipelineTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: {
    stages: Array<{
      name: string;
      description?: string;
      color: string;
      order_index: number;
      stage_config?: any;
      required_fields?: string[];
      validation_rules?: any[];
      actions?: Omit<StageAction, 'id' | 'stage_id' | 'created_at' | 'updated_at'>[];
    }>;
    pipeline_config?: any;
  };
  category: string;
  is_public: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type ActionType = StageAction['action_type'];