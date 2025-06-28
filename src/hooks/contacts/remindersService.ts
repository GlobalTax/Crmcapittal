
import { supabase } from '@/integrations/supabase/client';
import { ContactReminder } from '@/types/Contact';

export const fetchReminders = async () => {
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
    return typedReminders;
  }
  return [];
};

export const createReminder = async (contactId: string, reminderData: Partial<ContactReminder>, userId?: string) => {
  // Ensure required fields are present
  if (!reminderData.title || !reminderData.reminder_date) {
    throw new Error('Title and reminder date are required');
  }

  const { data, error } = await supabase
    .from('contact_reminders')
    .insert({
      contact_id: contactId,
      created_by: userId,
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

  return typedReminder;
};
