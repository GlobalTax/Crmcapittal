
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactType } from '@/types/Contact';

export const fetchContacts = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Cast the data to ensure proper typing
  const typedContacts = (data || []).map(contact => ({
    ...contact,
    contact_type: contact.contact_type as ContactType,
    contact_priority: (contact.contact_priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
    is_active: contact.is_active ?? true,
    language_preference: contact.language_preference || 'es',
    preferred_contact_method: contact.preferred_contact_method || 'email'
  }));
  
  return typedContacts;
};

export const createContact = async (contactData: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'created_by'>, userId?: string) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ ...contactData, created_by: userId }])
    .select()
    .single();

  if (error) throw error;
  
  // Cast the returned data
  const typedContact = {
    ...data,
    contact_type: data.contact_type as ContactType,
    contact_priority: (data.contact_priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
    is_active: data.is_active ?? true,
    language_preference: data.language_preference || 'es',
    preferred_contact_method: data.preferred_contact_method || 'email'
  };
  
  return typedContact;
};

export const updateContact = async (id: string, updates: Partial<Contact>) => {
  const { data, error } = await supabase
    .from('contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // Cast the returned data
  const typedContact = {
    ...data,
    contact_type: data.contact_type as ContactType,
    contact_priority: (data.contact_priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
    is_active: data.is_active ?? true,
    language_preference: data.language_preference || 'es',
    preferred_contact_method: data.preferred_contact_method || 'email'
  };
  
  return typedContact;
};

export const deleteContact = async (id: string) => {
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
