
import { supabase } from '@/integrations/supabase/client';
import { ContactTag } from '@/types/Contact';

export const fetchTags = async () => {
  const { data, error } = await supabase
    .from('contact_tags')
    .select('*')
    .order('name');

  if (!error && data) {
    const typedTags: ContactTag[] = data.map(tag => ({
      ...tag,
      color: tag.color || '#3B82F6'
    }));
    return typedTags;
  }
  return [];
};

export const createTag = async (tagData: Partial<ContactTag>, userId?: string) => {
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
      created_by: userId
    })
    .select()
    .single();

  if (error) throw error;

  const typedTag: ContactTag = {
    ...data,
    color: data.color || '#3B82F6'
  };

  return typedTag;
};

export const assignTagToContact = async (contactId: string, tagId: string) => {
  const { error } = await supabase
    .from('contact_tag_relations')
    .insert({ contact_id: contactId, tag_id: tagId });

  if (error) throw error;
};
