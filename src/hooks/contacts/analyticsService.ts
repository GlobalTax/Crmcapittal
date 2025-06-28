
import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/Contact';

export const calculateAnalytics = async (contactsData: Contact[]) => {
  const totalContacts = contactsData.length;
  const activeContacts = contactsData.filter(c => c.is_active).length;
  
  // Analytics por tipo
  const contactsByType = contactsData.reduce((acc, contact) => {
    acc[contact.contact_type] = (acc[contact.contact_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Analytics por prioridad
  const contactsByPriority = contactsData.reduce((acc, contact) => {
    const priority = contact.contact_priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Interacciones recientes
  const { data: recentInteractions } = await supabase
    .from('contact_interactions')
    .select('*')
    .gte('interaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('interaction_date', { ascending: false });

  const interactionsByType = (recentInteractions || []).reduce((acc, interaction) => {
    acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalContacts,
    activeContacts,
    contactsByType,
    contactsByPriority,
    interactionsByType,
    recentInteractions: recentInteractions?.length || 0
  };
};
