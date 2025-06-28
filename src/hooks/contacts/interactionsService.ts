
import { supabase } from '@/integrations/supabase/client';
import { ContactInteraction } from '@/types/Contact';

export const fetchInteractions = async () => {
  const { data, error } = await supabase
    .from('contact_interactions')
    .select('*')
    .order('interaction_date', { ascending: false })
    .limit(100);

  if (!error && data) {
    // Type cast interaction data
    const typedInteractions: ContactInteraction[] = data.map(interaction => ({
      ...interaction,
      interaction_type: interaction.interaction_type as 'email' | 'call' | 'meeting' | 'linkedin' | 'whatsapp' | 'video_call' | 'in_person',
      interaction_method: interaction.interaction_method as 'inbound' | 'outbound' | undefined,
      outcome: interaction.outcome as 'positive' | 'negative' | 'neutral' | 'follow_up_needed' | undefined,
      attendees: interaction.attendees || undefined,
      documents_shared: interaction.documents_shared || undefined
    }));
    return typedInteractions;
  }
  return [];
};

export const createInteraction = async (contactId: string, interactionData: Partial<ContactInteraction>, userId?: string) => {
  const { data, error } = await supabase
    .from('contact_interactions')
    .insert({
      contact_id: contactId,
      created_by: userId,
      interaction_date: new Date().toISOString(),
      interaction_type: interactionData.interaction_type || 'email',
      interaction_method: interactionData.interaction_method,
      subject: interactionData.subject,
      description: interactionData.description,
      outcome: interactionData.outcome,
      next_action: interactionData.next_action,
      next_action_date: interactionData.next_action_date,
      duration_minutes: interactionData.duration_minutes,
      location: interactionData.location,
      attendees: interactionData.attendees,
      documents_shared: interactionData.documents_shared
    })
    .select()
    .single();

  if (error) throw error;

  // Type cast the returned data
  const typedInteraction: ContactInteraction = {
    ...data,
    interaction_type: data.interaction_type as 'email' | 'call' | 'meeting' | 'linkedin' | 'whatsapp' | 'video_call' | 'in_person',
    interaction_method: data.interaction_method as 'inbound' | 'outbound' | undefined,
    outcome: data.outcome as 'positive' | 'negative' | 'neutral' | 'follow_up_needed' | undefined,
    attendees: data.attendees || undefined,
    documents_shared: data.documents_shared || undefined
  };

  return typedInteraction;
};
