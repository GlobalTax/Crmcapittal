import { BaseService, ServiceResponse, PaginationParams, FilterParams } from '../base/BaseService';
import { Contact } from '@/types/Contact';
import { Database } from '@/integrations/supabase/types';

export type DbContact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export interface CreateContactData extends Omit<ContactInsert, 'id' | 'created_at' | 'updated_at'> {
  name: string;
}

export type ContactActivity = Database['public']['Tables']['contact_activities']['Row'];
export type ContactNote = Database['public']['Tables']['contact_notes']['Row'];
export type ContactInteraction = Database['public']['Tables']['contact_interactions']['Row'];

export interface ContactFilters extends FilterParams {
  companyId?: string;
  contact_type?: string;
  lifecycle_stage?: string;
}

export class ContactService extends BaseService {
  static async getContacts(filters?: ContactFilters & PaginationParams): Promise<ServiceResponse<DbContact[]>> {
    try {
      let query = this.supabase
        .from('contacts')
        .select('*')
        .eq('contact_status', 'active')
        .order('name', { ascending: true });

      // Apply filters
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,position.ilike.%${filters.search}%`);
      }

      if (filters?.companyId) {
        query = query.or(`company_id.eq.${filters.companyId},contact_type.eq.lead`);
      }

      if (filters?.contact_type) {
        query = query.eq('contact_type', filters.contact_type);
      }

      if (filters?.lifecycle_stage) {
        query = query.eq('lifecycle_stage', filters.lifecycle_stage);
      }

      // Apply pagination
      if (filters?.limit) {
        const from = ((filters.page || 1) - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async getContactById(id: string): Promise<ServiceResponse<DbContact>> {
    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async createContact(contactData: CreateContactData): Promise<ServiceResponse<DbContact>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('contacts')
        .insert({
          ...contactData,
          created_by: user.user?.id
        } as ContactInsert)
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async updateContact(id: string, updates: Partial<CreateContactData>): Promise<ServiceResponse<DbContact>> {
    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .update(updates as ContactUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteContact(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('contacts')
        .delete()
        .eq('id', id);
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(null);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  // Activities
  static async getContactActivities(contactId: string): Promise<ServiceResponse<ContactActivity[]>> {
    try {
      const { data, error } = await this.supabase
        .from('contact_activities')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  // Notes
  static async getContactNotes(contactId: string): Promise<ServiceResponse<ContactNote[]>> {
    try {
      const { data, error } = await this.supabase
        .from('contact_notes')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async createContactNote(contactId: string, note: string, noteType?: string): Promise<ServiceResponse<ContactNote>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('contact_notes')
        .insert({
          contact_id: contactId,
          note,
          note_type: noteType || 'general',
          created_by: user.user?.id
        })
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteContactNote(noteId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('contact_notes')
        .delete()
        .eq('id', noteId);
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(null);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  // Interactions
  static async getContactInteractions(contactId: string): Promise<ServiceResponse<ContactInteraction[]>> {
    try {
      const { data, error } = await this.supabase
        .from('contact_interactions')
        .select('*')
        .eq('contact_id', contactId)
        .order('interaction_date', { ascending: false });
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async createContactInteraction(interactionData: Omit<ContactInteraction, 'id' | 'created_at' | 'created_by'>): Promise<ServiceResponse<ContactInteraction>> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const { data, error } = await this.supabase
        .from('contact_interactions')
        .insert({
          ...interactionData,
          created_by: user.user?.id
        })
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async updateContactInteraction(id: string, updates: Partial<ContactInteraction>): Promise<ServiceResponse<ContactInteraction>> {
    try {
      const { data, error } = await this.supabase
        .from('contact_interactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteContactInteraction(id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('contact_interactions')
        .delete()
        .eq('id', id);
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(null);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}