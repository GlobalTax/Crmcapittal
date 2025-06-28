
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
      
      const typedContacts = (contactsData || []).map(contact => ({
        ...contact,
        contact_type: contact.contact_type as ContactType
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
      setInteractions(data);
    }
  };

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('contact_reminders')
      .select('*')
      .eq('is_completed', false)
      .order('reminder_date', { ascending: true });

    if (!error && data) {
      setReminders(data);
    }
  };

  const fetchTags = async () => {
    const { data, error } = await supabase
      .from('contact_tags')
      .select('*')
      .order('name');

    if (!error && data) {
      setTags(data);
    }
  };

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('contact_companies')
      .select('*')
      .order('company_name');

    if (!error && data) {
      setCompanies(data);
    }
  };

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('communication_templates')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setTemplates(data);
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
        .insert([{
          contact_id: contactId,
          created_by: user?.id,
          interaction_date: new Date().toISOString(),
          ...interactionData
        }])
        .select()
        .single();

      if (error) throw error;

      setInteractions(prev => [data, ...prev]);
      toast({
        title: "Interacción registrada",
        description: "La interacción se ha guardado correctamente",
      });

      return data;
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
      const { data, error } = await supabase
        .from('contact_reminders')
        .insert([{
          contact_id: contactId,
          created_by: user?.id,
          ...reminderData
        }])
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data]);
      toast({
        title: "Recordatorio creado",
        description: "El recordatorio se ha programado correctamente",
      });

      return data;
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
      const { data, error } = await supabase
        .from('contact_tags')
        .insert([{
          created_by: user?.id,
          ...tagData
        }])
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data]);
      toast({
        title: "Etiqueta creada",
        description: "La etiqueta se ha creado correctamente",
      });

      return data;
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
        .insert([{ contact_id: contactId, tag_id: tagId }]);

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
