
import { supabase } from '@/integrations/supabase/client';
import { Contact, ContactType } from '@/types/Contact';

export const fetchContacts = async () => {
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
  
  return typedContacts;
};

export const bulkUpdateContacts = async (contactIds: string[], updates: Partial<Contact>) => {
  const { error } = await supabase
    .from('contacts')
    .update(updates)
    .in('id', contactIds);

  if (error) throw error;
};

export const exportContacts = async (format: 'csv' | 'json' = 'csv') => {
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
};
