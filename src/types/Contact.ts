
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
