
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  contact_type: ContactType;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Nuevos campos enriquecidos
  linkedin_url?: string;
  website_url?: string;
  preferred_contact_method?: string;
  investment_capacity_min?: number;
  investment_capacity_max?: number;
  sectors_of_interest?: string[];
  deal_preferences?: any;
  contact_source?: string;
  last_interaction_date?: string;
  contact_priority?: 'low' | 'medium' | 'high' | 'urgent';
  is_active?: boolean;
  time_zone?: string;
  language_preference?: string;
}

export type ContactType = 
  | 'buyer' 
  | 'seller' 
  | 'advisor' 
  | 'lawyer' 
  | 'banker' 
  | 'accountant' 
  | 'consultant' 
  | 'investor' 
  | 'broker'
  | 'other';

export interface ContactNote {
  id: string;
  contact_id: string;
  note: string;
  note_type: 'general' | 'meeting' | 'call' | 'email' | 'follow_up';
  created_by?: string;
  created_at: string;
}

export interface ContactOperation {
  id: string;
  contact_id: string;
  operation_id: string;
  relationship_type: 'buyer' | 'seller' | 'advisor' | 'involved';
  created_at: string;
}

export interface ContactCompany {
  id: string;
  contact_id: string;
  company_name: string;
  company_website?: string;
  company_linkedin?: string;
  company_size?: string;
  company_revenue?: number;
  company_sector?: string;
  company_location?: string;
  company_description?: string;
  founded_year?: number;
  is_primary?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
  created_by?: string;
  created_at: string;
}

export interface ContactTagRelation {
  id: string;
  contact_id: string;
  tag_id: string;
  created_at: string;
}

export interface ContactInteraction {
  id: string;
  contact_id: string;
  interaction_type: 'email' | 'call' | 'meeting' | 'linkedin' | 'whatsapp' | 'video_call' | 'in_person';
  interaction_method?: 'inbound' | 'outbound';
  subject?: string;
  description?: string;
  outcome?: 'positive' | 'negative' | 'neutral' | 'follow_up_needed';
  next_action?: string;
  next_action_date?: string;
  duration_minutes?: number;
  location?: string;
  attendees?: any;
  documents_shared?: string[];
  created_by?: string;
  created_at: string;
  interaction_date?: string;
}

export interface ContactReminder {
  id: string;
  contact_id: string;
  title: string;
  description?: string;
  reminder_date: string;
  reminder_type?: 'follow_up' | 'birthday' | 'meeting' | 'deadline';
  is_completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  created_by?: string;
  created_at: string;
  completed_at?: string;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  template_type: 'email' | 'linkedin' | 'proposal' | 'follow_up';
  subject?: string;
  content: string;
  variables?: any;
  is_active?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'buyer', label: 'Comprador' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'advisor', label: 'Asesor' },
  { value: 'lawyer', label: 'Abogado' },
  { value: 'banker', label: 'Banquero' },
  { value: 'accountant', label: 'Contador' },
  { value: 'consultant', label: 'Consultor' },
  { value: 'investor', label: 'Inversor' },
  { value: 'broker', label: 'Broker' },
  { value: 'other', label: 'Otro' },
];

export const INTERACTION_TYPES = [
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'call', label: 'Llamada', icon: 'Phone' },
  { value: 'meeting', label: 'Reunión', icon: 'Calendar' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'Linkedin' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle' },
  { value: 'video_call', label: 'Video Llamada', icon: 'Video' },
  { value: 'in_person', label: 'En Persona', icon: 'Users' },
];

export const CONTACT_PRIORITIES = [
  { value: 'low', label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Media', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-100 text-red-800' },
];
