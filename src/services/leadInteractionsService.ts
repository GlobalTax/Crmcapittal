import { supabase } from '@/integrations/supabase/client';
import { LeadInteraction, CreateLeadInteractionData, UpdateLeadInteractionData } from '@/types/LeadInteraction';
import { logger } from '@/utils/productionLogger';

export const leadInteractionsService = {
  // Obtener todas las interacciones de un lead
  async getLeadInteractions(leadId: string): Promise<LeadInteraction[]> {
    const { data, error } = await supabase
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', leadId)
      .order('fecha', { ascending: false });

    if (error) {
      logger.error('Failed to fetch lead interactions', { error, leadId });
      throw new Error('Error al cargar las interacciones del lead');
    }

    return data || [];
  },

  // Crear una nueva interacción
  async createInteraction(interactionData: CreateLeadInteractionData): Promise<LeadInteraction> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('lead_interactions')
      .insert({
        ...interactionData,
        user_id: userData.user?.id,
        fecha: interactionData.fecha || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create lead interaction', { error, interactionData });
      throw new Error('Error al crear la interacción');
    }

    return data;
  },

  // Actualizar una interacción
  async updateInteraction(updates: UpdateLeadInteractionData): Promise<LeadInteraction> {
    const { id, ...updateData } = updates;
    
    const { data, error } = await supabase
      .from('lead_interactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update lead interaction', { error, updates });
      throw new Error('Error al actualizar la interacción');
    }

    return data;
  },

  // Eliminar una interacción
  async deleteInteraction(id: string): Promise<void> {
    const { error } = await supabase
      .from('lead_interactions')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete lead interaction', { error, id });
      throw new Error('Error al eliminar la interacción');
    }
  }
};