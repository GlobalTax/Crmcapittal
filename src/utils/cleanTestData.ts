import { supabase } from '@/integrations/supabase/client';

export const cleanTestContacts = async () => {
  // Patterns to identify test/fake data
  const testPatterns = [
    // Email patterns
    /^[a-z]@[a-z]\.com$/,
    /^[a-z]@[a-z]{1,2}\.es$/,
    /prueba\.com$/,
    /test\.com$/,
    /example\.com$/,
    
    // Name patterns
    /^prueba/i,
    /^test/i,
    /^\s*prueb/i,
    /^\s+$/, // Only whitespace
    /^[a-z]{1,2}$/i, // Single letters
  ];

  try {
    // Get all contacts
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    const testContactIds: string[] = [];

    contacts?.forEach(contact => {
      const isTestData = 
        // Check email patterns
        (contact.email && testPatterns.some(pattern => pattern.test(contact.email))) ||
        // Check name patterns
        testPatterns.some(pattern => pattern.test(contact.name)) ||
        // Check for incomplete data
        (!contact.email && !contact.phone && !contact.company) ||
        // Check company patterns
        (contact.company && /^[a-z]{1,2}$/i.test(contact.company));

      if (isTestData) {
        testContactIds.push(contact.id);
      }
    });

    if (testContactIds.length > 0) {
      // Soft delete test contacts
      const { error: updateError } = await supabase
        .from('contacts')
        .update({ is_active: false })
        .in('id', testContactIds);

      if (updateError) throw updateError;

      console.log(`Cleaned ${testContactIds.length} test contacts`);
      return testContactIds.length;
    }

    return 0;
  } catch (error) {
    console.error('Error cleaning test data:', error);
    throw error;
  }
};

export const createSampleContacts = async () => {
  const sampleContacts = [
    {
      name: 'María García López',
      email: 'maria.garcia@techcorp.es',
      phone: '+34 91 123 45 67',
      company: 'TechCorp Solutions',
      position: 'Directora de Desarrollo',
      contact_type: 'cliente',
      contact_priority: 'high',
      contact_source: 'referido',
      lifecycle_stage: 'cliente',
      sectors_of_interest: ['Tecnología', 'Software'],
      notes: 'Cliente estratégico con múltiples proyectos en cartera'
    },
    {
      name: 'Carlos Rodríguez Mendez',
      email: 'carlos.rodriguez@innovatech.com',
      phone: '+34 93 987 65 43',
      company: 'InnovaTech Consulting',
      position: 'CEO',
      contact_type: 'sales',
      contact_priority: 'high',
      contact_source: 'networking',
      lifecycle_stage: 'lead',
      sectors_of_interest: ['Consultoría', 'Transformación Digital'],
      notes: 'Interesado en servicios de M&A para empresas tecnológicas'
    },
    {
      name: 'Ana Martín Ruiz',
      email: 'ana.martin@financeplus.es',
      phone: '+34 95 456 78 90',
      company: 'Finance Plus Advisory',
      position: 'Socia Directora',
      contact_type: 'prospect',
      contact_priority: 'medium',
      contact_source: 'web',
      lifecycle_stage: 'lead',
      sectors_of_interest: ['Servicios Financieros', 'Consultoría'],
      notes: 'Contacto inicial vía web, necesita más información sobre nuestros servicios'
    }
  ];

  try {
    const { data: user } = await supabase.auth.getUser();
    
    const contactsWithUser = sampleContacts.map(contact => ({
      ...contact,
      created_by: user?.user?.id,
      is_active: true
    }));

    const { error } = await supabase
      .from('contacts')
      .insert(contactsWithUser);

    if (error) throw error;

    console.log(`Created ${sampleContacts.length} sample contacts`);
    return sampleContacts.length;
  } catch (error) {
    console.error('Error creating sample contacts:', error);
    throw error;
  }
};