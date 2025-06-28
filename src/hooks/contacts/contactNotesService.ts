
import { supabase } from '@/integrations/supabase/client';
import { ContactNote } from '@/types/Contact';

export const fetchContactNotes = async (contactId: string) => {
  const { data, error } = await supabase
    .from('contact_notes')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Cast the data to ensure proper typing
  const typedNotes = (data || []).map(note => ({
    ...note,
    note_type: note.note_type as ContactNote['note_type']
  }));
  
  return typedNotes;
};

export const createContactNote = async (contactId: string, note: string, noteType: ContactNote['note_type'] = 'general', userId?: string) => {
  const { data, error } = await supabase
    .from('contact_notes')
    .insert([{
      contact_id: contactId,
      note,
      note_type: noteType,
      created_by: userId
    }])
    .select()
    .single();

  if (error) throw error;
  
  // Cast the returned data
  const typedNote = {
    ...data,
    note_type: data.note_type as ContactNote['note_type']
  };
  
  return typedNote;
};
