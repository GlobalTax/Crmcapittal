/**
 * Contact Service
 * 
 * Service layer for contact CRUD operations and business logic
 */

import { supabase } from '@/integrations/supabase/client';
import { Contact, CreateContactData, UpdateContactData, UseContactsOptions } from '../types';

export class ContactService {
  /**
   * Fetch contacts with filtering and pagination
   */
  static async fetchContacts(options: UseContactsOptions = {}) {
    const { 
      page = 1, 
      limit = 50, 
      searchTerm = "", 
      companyId, 
      statusFilter = "active",
      typeFilter = "all" 
    } = options;
    
    console.log("🔍 Fetching contacts with filters:", { searchTerm, companyId, statusFilter, typeFilter, page, limit });
    
    let query = supabase
      .from('contacts')
      .select('*', { count: "exact" })
      .order('updated_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq('contact_status', statusFilter as Contact['contact_status']);
    } else {
      // Default to active contacts only
      query = query.eq('contact_status', 'active');
    }

    // Apply search filter
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,position.ilike.%${searchTerm}%`);
    }

    // Apply company filter
    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      query = query.eq('contact_type', typeFilter);
    }

    // Apply pagination
    if (page && limit) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Error fetching contacts:', error);
      throw error;
    }

    console.log("✅ Successfully fetched contacts:", data?.length || 0);

    return {
      contacts: data as Contact[],
      totalCount: count || 0,
      currentPage: page,
      totalPages: limit ? Math.ceil((count || 0) / limit) : 1
    };
  }

  /**
   * Get a single contact by ID
   */
  static async fetchContactById(contactId: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (error) {
      console.error('Error fetching contact:', error);
      throw error;
    }

    return data as Contact;
  }

  /**
   * Create a new contact
   */
  static async createContact(contactData: CreateContactData, userId: string): Promise<Contact> {
    console.log("📞 Creating contact with data:", contactData);
    
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        ...contactData,
        created_by: userId,
        is_active: true,
        contact_status: contactData.contact_status || 'active',
        contact_roles: contactData.contact_roles || ['other'],
        // Handle company_id properly - only include if not empty
        ...(contactData.company_id && { company_id: contactData.company_id }),
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating contact:', error);
      throw error;
    }

    console.log("✅ Contact created successfully:", data.id);
    return data as Contact;
  }

  /**
   * Update an existing contact
   */
  static async updateContact(contactData: UpdateContactData): Promise<Contact> {
    const { id, ...updateData } = contactData;
    
    const { data, error } = await supabase
      .from('contacts')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating contact:', error);
      throw error;
    }

    return data as Contact;
  }

  /**
   * Delete (archive) a contact
   */
  static async deleteContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .update({ contact_status: 'archived' })
      .eq('id', contactId);

    if (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Link contact to company
   */
  static async linkContactToCompany(contactId: string, companyId: string, companyName: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        company_id: companyId,
        company: companyName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error) {
      console.error('Error linking contact to company:', error);
      throw error;
    }

    return data as Contact;
  }

  /**
   * Unlink contact from company
   */
  static async unlinkContactFromCompany(contactId: string): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update({
        company_id: null,
        company: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error) {
      console.error('Error unlinking contact from company:', error);
      throw error;
    }

    return data as Contact;
  }
}