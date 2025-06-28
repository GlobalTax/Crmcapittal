
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Contact, 
  ContactInteraction, 
  ContactReminder, 
  ContactTag, 
  ContactCompany,
  CommunicationTemplate,
  ContactType 
} from '@/types/Contact';

export const useAdvancedContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<ContactInteraction[]>([]);
  const [reminders, setReminders] = useState<ContactReminder[]>([]);
  const [tags, setTags] = useState<ContactTag[]>([]);
  const [companies, setCompanies] = useState<ContactCompany[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch contacts with enhanced data
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;
      
      // Type cast and sanitize the data from Supabase
      const typedContacts: Contact[] = (contactsData || []).map(contact => ({
        ...contact,
        contact_type: contact.contact_type as ContactType,
        contact_priority: (contact.contact_priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        is_active: contact.is_active ?? true,
        language_preference: contact.language_preference || 'es',
        preferred_contact_method: contact.preferred_contact_method || 'email'
      }));
      
      setContacts(typedContacts);

      // Fetch all related data
      await Promise.all([
        fetchInteractions(),
        fetchReminders(),
        fetchTags(),
        fetchCompanies(),
        fetchTemplates(),
        calculateAnalytics(typedContacts)
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInteractions = async () => {
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
      setInteractions(typedInteractions);
    }
  };

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('contact_reminders')
      .select('*')
      .eq('is_completed', false)
      .order('reminder_date', { ascending: true });

    if (!error && data) {
      // Type cast reminder data
      const typedReminders: ContactReminder[] = data.map(reminder => ({
        ...reminder,
        reminder_type: (reminder.reminder_type as 'follow_up' | 'birthday' | 'meeting' | 'deadline') || 'follow_up',
        priority: (reminder.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        is_completed: reminder.is_completed ?? false
      }));
      setReminders(typedReminders);
    }
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('contact_tags')
      .select('*')
      .order('name');

    if (!error && data) {
      const typedTags: ContactTag[] = data.map(tag => ({
        ...tag,
        color: tag.color || '#3B82F6'
      }));
      setTags(typedTags);
    }
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('contact_companies')
      .select('*')
      .order('company_name');

    if (!error && data) {
      const typedCompanies: ContactCompany[] = data.map(company => ({
        ...company,
        is_primary: company.is_primary ?? true
      }));
      setCompanies(typedCompanies);
    }
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('communication_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      // Type cast template data
      const typedTemplates: CommunicationTemplate[] = data.map(template => ({
        ...template,
        template_type: template.template_type as 'email' | 'linkedin' | 'proposal' | 'follow_up',
        is_active: template.is_active ?? true,
        variables: template.variables || undefined
      }));
      setTemplates(typedTemplates);
    }
  };

  const calculateAnalytics = async (contactsData: Contact[]) => {
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

    setAnalytics({
      totalContacts,
      activeContacts,
      contactsByType,
      contactsByPriority,
      interactionsByType,
      recentInteractions: recentInteractions?.length || 0
    });
  };

  const addInteraction = async (contactId: string, interactionData: Partial<ContactInteraction>) => {
    try {
      const { data, error } = await supabase
        .from('contact_interactions')
        .insert({
          contact_id: contactId,
          created_by: user?.id,
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

      setInteractions(prev => [typedInteraction, ...prev]);
      toast({
        title: "Interacción registrada",
        description: "La interacción se ha guardado correctamente",
      });

      return typedInteraction;
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar la interacción",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addReminder = async (contactId: string, reminderData: Partial<ContactReminder>) => {
    try {
      // Ensure required fields are present
      if (!reminderData.title || !reminderData.reminder_date) {
        throw new Error('Title and reminder date are required');
      }

      const { data, error } = await supabase
        .from('contact_reminders')
        .insert({
          contact_id: contactId,
          created_by: user?.id,
          title: reminderData.title,
          description: reminderData.description,
          reminder_date: reminderData.reminder_date,
          reminder_type: reminderData.reminder_type || 'follow_up',
          priority: reminderData.priority || 'medium',
          is_completed: reminderData.is_completed || false
        })
        .select()
        .single();

      if (error) throw error;

      // Type cast the returned data
      const typedReminder: ContactReminder = {
        ...data,
        reminder_type: (data.reminder_type as 'follow_up' | 'birthday' | 'meeting' | 'deadline') || 'follow_up',
        priority: (data.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
        is_completed: data.is_completed ?? false
      };

      setReminders(prev => [...prev, typedReminder]);
      toast({
        title: "Recordatorio creado",
        description: "El recordatorio se ha programado correctamente",
      });

      return typedReminder;
    } catch (error) {
      console.error('Error adding reminder:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el recordatorio",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createTag = async (tagData: Partial<ContactTag>) => {
    try {
      // Ensure name is present
      if (!tagData.name) {
        throw new Error('Tag name is required');
      }

      const { data, error } = await supabase
        .from('contact_tags')
        .insert({
          name: tagData.name,
          color: tagData.color || '#3B82F6',
          description: tagData.description,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const typedTag: ContactTag = {
        ...data,
        color: data.color || '#3B82F6'
      };

      setTags(prev => [...prev, typedTag]);
      toast({
        title: "Etiqueta creada",
        description: "La etiqueta se ha creado correctamente",
      });

      return typedTag;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la etiqueta",
        variant: "destructive",
      });
      throw error;
    }
  };

  const assignTagToContact = async (contactId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('contact_tag_relations')
        .insert({ contact_id: contactId, tag_id: tagId });

      if (error) throw error;

      toast({
        title: "Etiqueta asignada",
        description: "La etiqueta se ha asignado al contacto",
      });
    } catch (error) {
      console.error('Error assigning tag:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar la etiqueta",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateContacts = async (contactIds: string[], updates: Partial<Contact>) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update(updates)
        .in('id', contactIds);

      if (error) throw error;

      // Refresh contacts
      await fetchAllData();
      
      toast({
        title: "Actualización masiva completada",
        description: `${contactIds.length} contactos actualizados`,
      });
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      toast({
        title: "Error",
        description: "No se pudo realizar la actualización masiva",
        variant: "destructive",
      });
    }
  };

  const exportContacts = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*');

      if (error) throw error;

      if (format === 'csv') {
        // Convert to CSV
        const headers = Object.keys(data[0] || {});
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // JSON export
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Exportación completada",
        description: "Los contactos se han exportado correctamente",
      });
    } catch (error) {
      console.error('Error exporting contacts:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar los contactos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    contacts,
    interactions,
    reminders,
    tags,
    companies,
    templates,
    analytics,
    loading,
    addInteraction,
    addReminder,
    createTag,
    assignTagToContact,
    bulkUpdateContacts,
    exportContacts,
    refetch: fetchAllData,
  };
};
