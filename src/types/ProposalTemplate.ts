export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'M&A' | 'Valoracion' | 'Consultoria' | 'Due Diligence' | 'Legal';
  practice_area_id?: string;
  is_default: boolean;
  content_structure: TemplateSection[];
  visual_config: VisualConfig;
  usage_count: number;
  success_rate: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateSection {
  id: string;
  type: 'text' | 'services' | 'fees' | 'timeline' | 'terms' | 'signature';
  title: string;
  content?: string;
  order: number;
  required: boolean;
  editable?: boolean;
}

export interface VisualConfig {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  logo_url?: string;
  cover_image_url?: string;
  custom_css?: string;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  category: ProposalTemplate['category'];
  practice_area_id?: string;
  content_structure: TemplateSection[];
  visual_config: VisualConfig;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  category?: ProposalTemplate['category'];
  content_structure?: TemplateSection[];
  visual_config?: VisualConfig;
  is_active?: boolean;
}

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  category: 'cliente' | 'empresa' | 'fecha' | 'proyecto' | 'honorarios';
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  // Cliente variables
  { key: 'cliente.nombre', label: 'Nombre del Cliente', example: 'Juan Pérez', category: 'cliente' },
  { key: 'cliente.email', label: 'Email del Cliente', example: 'juan@empresa.com', category: 'cliente' },
  { key: 'cliente.cargo', label: 'Cargo del Cliente', example: 'CEO', category: 'cliente' },
  
  // Empresa variables
  { key: 'empresa.nombre', label: 'Nombre de la Empresa', example: 'TechCorp S.L.', category: 'empresa' },
  { key: 'empresa.sector', label: 'Sector de la Empresa', example: 'Tecnología', category: 'empresa' },
  { key: 'empresa.ubicacion', label: 'Ubicación', example: 'Madrid, España', category: 'empresa' },
  
  // Fecha variables
  { key: 'fecha.hoy', label: 'Fecha de Hoy', example: '7 de agosto de 2025', category: 'fecha' },
  { key: 'fecha.valoracion', label: 'Fecha de Valoración', example: '31 de diciembre de 2024', category: 'fecha' },
  
  // Proyecto variables
  { key: 'proyecto.duracion', label: 'Duración del Proyecto', example: '3-4', category: 'proyecto' },
  { key: 'proyecto.semanas', label: 'Semanas del Proyecto', example: '6-8', category: 'proyecto' },
  
  // Honorarios variables
  { key: 'honorarios.fijos', label: 'Honorarios Fijos', example: '15.000', category: 'honorarios' },
  { key: 'honorarios.porcentaje', label: 'Porcentaje de Éxito', example: '2,5', category: 'honorarios' },
  { key: 'honorarios.total', label: 'Total Honorarios', example: '25.000', category: 'honorarios' },
  
  // Condiciones variables
  { key: 'vigencia.dias', label: 'Vigencia en Días', example: '30', category: 'proyecto' }
];