
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Contact, 
  ContactInteraction, 
  ContactReminder, 
  ContactTag, 
  ContactCompany,
  CommunicationTemplate
} from '@/types/Contact';

// Import services
import { fetchContacts, bulkUpdateContacts, exportContacts } from './contacts/contactsDataService';
import { fetchInteractions, createInteraction } from './contacts/interactionsService';
import { fetchReminders, createReminder } from './contacts/remindersService';
import { fetchTags, createTag, assignTagToContact } from './contacts/tagsService';
import { fetchCompanies } from './contacts/companiesService';
import { fetchTemplates } from './contacts/templatesService';
import { calculateAnalytics } from './contacts/analyticsService';

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
      const contactsData = await fetchContacts();
      setContacts(contactsData);

      // Fetch all related data
      const [
        interactionsData,
        remindersData,
        tagsData,
        companiesData,
        templatesData,
        analyticsData
      ] = await Promise.all([
        fetchInteractions(),
        fetchReminders(),
        fetchTags(),
        fetchCompanies(),
        fetchTemplates(),
        calculateAnalytics(contactsData)
      ]);

      setInteractions(interactionsData);
      setReminders(remindersData);
      setTags(tagsData);
      setCompanies(companiesData);
      setTemplates(templatesData);
      setAnalytics(analyticsData);

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

  const addInteraction = async (contactId: string, interactionData: Partial<ContactInteraction>) => {
    try {
      const typedInteraction = await createInteraction(contactId, interactionData, user?.id);
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
      const typedReminder = await createReminder(contactId, reminderData, user?.id);
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

  const createContactTag = async (tagData: Partial<ContactTag>) => {
    try {
      const typedTag = await createTag(tagData, user?.id);
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

  const assignContactTag = async (contactId: string, tagId: string) => {
    try {
      await assignTagToContact(contactId, tagId);
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

  const bulkUpdateContactsData = async (contactIds: string[], updates: Partial<Contact>) => {
    try {
      await bulkUpdateContacts(contactIds, updates);
      
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

  const exportContactsData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      await exportContacts(format);
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
    createTag: createContactTag,
    assignTagToContact: assignContactTag,
    bulkUpdateContacts: bulkUpdateContactsData,
    exportContacts: exportContactsData,
    refetch: fetchAllData,
  };
};
