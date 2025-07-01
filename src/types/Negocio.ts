
export interface Negocio {
  id: string;
  nombre_negocio: string;
  company_id?: string;
  contact_id?: string;
  valor_negocio?: number;
  moneda: string;
  tipo_negocio: string;
  stage_id?: string;
  prioridad: string;
  propietario_negocio?: string;
  ebitda?: number;
  ingresos?: number;
  multiplicador?: number;
  sector?: string;
  ubicacion?: string;
  empleados?: number;
  descripcion?: string;
  fuente_lead?: string;
  proxima_actividad?: string;
  notas?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  fecha_cierre?: string;
  is_active: boolean;
  stage?: {
    id: string;
    name: string;
    color: string;
    order_index: number;
  };
  company?: {
    id: string;
    name: string;
    industry?: string;
    website?: string;
  };
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    position?: string;
  };
}

export type NegocioPrioridad = 'baja' | 'media' | 'alta' | 'urgente';
export type NegocioTipo = 'venta' | 'compra' | 'fusion' | 'valoracion' | 'consultoria';
