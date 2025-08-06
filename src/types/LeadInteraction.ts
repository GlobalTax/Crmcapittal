export type InteractionType = 'email' | 'llamada' | 'reunion' | 'nota' | 'task';

export interface LeadInteraction {
  id: string;
  lead_id: string;
  tipo: InteractionType;
  detalle?: string;
  user_id?: string;
  fecha: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadInteractionData {
  lead_id: string;
  tipo: InteractionType;
  detalle?: string;
  fecha?: string;
}

export interface UpdateLeadInteractionData extends Partial<CreateLeadInteractionData> {
  id: string;
}