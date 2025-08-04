import { BaseService } from '@/shared/services/BaseService';
import { ServiceResponse, PaginationParams } from '@/shared/types/common';
import { Contact, CreateContactData } from '../types/Contact';
import { ContactFilters } from '../types/ContactFilters';
import { Database } from '@/integrations/supabase/types';

export type DbContact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export type ContactActivity = Database['public']['Tables']['contact_activities']['Row'];
export type ContactNote = Database['public']['Tables']['contact_notes']['Row'];
export type ContactInteraction = Database['public']['Tables']['contact_interactions']['Row'];

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

      if (filters?.contact_status) {
        // Only filter by active status which exists in DB
        if (filters.contact_status === 'active') {
          query = query.eq('contact_status', 'active');
        }
      }

      if (filters?.contact_priority) {
        query = query.eq('contact_priority', filters.contact_priority);
      }

      if (filters?.company_name) {
        query = query.ilike('company_name', `%${filters.company_name}%`);
      }

      if (filters?.position) {
        query = query.ilike('position', `%${filters.position}%`);
      }

      if (filters?.department) {
        query = query.ilike('department', `%${filters.department}%`);
      }

      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }

      if (filters?.lead_score_min !== undefined) {
        query = query.gte('lead_score', filters.lead_score_min);
      }

      if (filters?.lead_score_max !== undefined) {
        query = query.lte('lead_score', filters.lead_score_max);
      }

      if (filters?.has_email !== undefined) {
        if (filters.has_email) {
          query = query.not('email', 'is', null);
        } else {
          query = query.is('email', null);
        }
      }

      if (filters?.has_phone !== undefined) {
        if (filters.has_phone) {
          query = query.not('phone', 'is', null);
        } else {
          query = query.is('phone', null);
        }
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
      
      // Simplified insert with only basic fields
      const insertData: ContactInsert = {
        name: contactData.name,
        contact_type: 'prospect',
        contact_status: 'active' as 'active',
        created_by: user.user?.id,
        ...(contactData.email && { email: contactData.email }),
        ...(contactData.phone && { phone: contactData.phone }),
        ...(contactData.company_id && { company_id: contactData.company_id }),
        ...(contactData.position && { position: contactData.position }),
        ...(contactData.notes && { notes: contactData.notes })
      };
      
      const { data, error } = await this.supabase
        .from('contacts')
        .insert(insertData)
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
      // Simplified update with only basic fields
      const updateData: Partial<ContactUpdate> = {
        ...(updates.name && { name: updates.name }),
        ...(updates.email && { email: updates.email }),
        ...(updates.phone && { phone: updates.phone }),
        ...(updates.company_id && { company_id: updates.company_id }),
        ...(updates.position && { position: updates.position }),
        ...(updates.notes && { notes: updates.notes })
      };
      
      const { data, error } = await this.supabase
        .from('contacts')
        .update(updateData)
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

  // Helper method to map frontend contact types to database types
  private static mapContactType(frontendType: string): string {
    const typeMap: Record<string, string> = {
      'client': 'prospect',
      'prospect': 'prospect',
      'partner': 'advisor',
      'investor': 'investor',
      'advisor': 'advisor',
      'vendor': 'broker',
      'lead': 'lead',
      'candidate': 'prospect',
      'referral': 'prospect'
    };
    
    return typeMap[frontendType] || 'prospect';
  }
}