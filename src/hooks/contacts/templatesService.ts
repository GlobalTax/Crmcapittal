
import { supabase } from '@/integrations/supabase/client';
import { CommunicationTemplate } from '@/types/Contact';

export const fetchTemplates = async () => {
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
    return typedTemplates;
  }
  return [];
};
