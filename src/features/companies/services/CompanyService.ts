/**
 * Company Service
 * 
 * Service layer for company CRUD operations and business logic
 */

import { supabase } from '@/integrations/supabase/client';
import { Company, CreateCompanyData, UpdateCompanyData, UseCompaniesOptions } from '../types';

export class CompanyService {
  /**
   * Fetch companies with enrichment and filtering
   */
  static async fetchCompanies(options: UseCompaniesOptions = {}) {
    const { page = 1, limit = 25, searchTerm = "", statusFilter = "all", typeFilter = "all" } = options;
    
    console.log("🔍 Fetching companies with filters:", { searchTerm, statusFilter, typeFilter, page, limit });
    
    // Base query for companies
    let query = supabase
      .from("companies")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    // Apply filters
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
    }
    
    if (statusFilter !== "all") {
      query = query.eq("company_status", statusFilter as Company['company_status']);
    }
    
    if (typeFilter !== "all") {
      query = query.eq("company_type", typeFilter as Company['company_type']);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("❌ Error fetching companies:", error);
      throw error;
    }

    console.log("✅ Successfully fetched companies:", data?.length || 0);

    // Enrich companies with additional data
    const enrichedCompanies = await Promise.all(
      (data || []).map(async (company) => {
        try {
          // Get enrichment data
          const { data: enrichmentData } = await supabase
            .from("company_enrichments")
            .select("enrichment_data")
            .eq("company_id", company.id)
            .limit(1)
            .maybeSingle();

          // Count contacts
          const { count: contactsCount } = await supabase
            .from("contacts")
            .select("*", { count: "exact", head: true })
            .eq("company_id", company.id);

          // Count active opportunities
          const { count: opportunitiesCount } = await supabase
            .from("opportunities")
            .select("*", { count: "exact", head: true })
            .eq("company_id", company.id)
            .neq("status", "closed");

          const enrichment = enrichmentData?.enrichment_data as any;

          // Calculate profile score (0-100)
          let profileScore = 0;
          if (company.name) profileScore += 15;
          if (company.domain) profileScore += 10;
          if (company.city) profileScore += 10;
          if (company.industry || enrichment?.sector) profileScore += 15;
          if (company.annual_revenue || enrichment?.revenue) profileScore += 15;
          if (company.phone) profileScore += 10;
          if (contactsCount > 0) profileScore += 15;
          if (opportunitiesCount > 0) profileScore += 10;

          // Determine profile status
          const profileStatus = profileScore >= 70 ? 'high' : profileScore >= 40 ? 'medium' : 'low';

          return {
            ...company,
            enrichment_data: enrichment,
            contacts_count: contactsCount || 0,
            opportunities_count: opportunitiesCount || 0,
            profile_score: profileScore,
            profile_status: profileStatus,
            sector: enrichment?.company_data?.actividad_principal || enrichment?.sector || company.industry,
          };
        } catch (enrichError) {
          console.error("❌ Error enriching company data for", company.id, enrichError);
          return {
            ...company,
            contacts_count: 0,
            opportunities_count: 0,
            profile_score: 15,
            profile_status: 'low',
            sector: company.industry,
          };
        }
      })
    );

    return {
      companies: enrichedCompanies as Company[],
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get a single company by ID with relations
   */
  static async fetchCompanyById(companyId: string): Promise<Company> {
    const { data, error } = await supabase
      .from("companies")
      .select(`
        *,
        contacts(id, name, email, phone, position),
        deals(id, deal_name, deal_value, stage_id)
      `)
      .eq("id", companyId)
      .single();

    if (error) {
      console.error("Error fetching company:", error);
      throw error;
    }

    return data as Company;
  }

  /**
   * Create a new company
   */
  static async createCompany(companyData: CreateCompanyData, userId: string): Promise<Company> {
    console.log("🏢 Creating company with data:", companyData);
    
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          ...companyData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating company:", error);
      throw error;
    }
    
    console.log("✅ Company created successfully:", data.id);

    // Auto-enrich with eInforma if NIF is provided
    if (data.nif && data.nif.trim()) {
      try {
        await supabase.functions.invoke('einforma-enrich-company', {
          body: { 
            nif: data.nif,
            companyId: data.id 
          }
        });
      } catch (enrichError) {
        console.log('Auto-enrichment failed, but company was created successfully:', enrichError);
      }
    }

    return data as Company;
  }

  /**
   * Update an existing company
   */
  static async updateCompany(id: string, updateData: UpdateCompanyData): Promise<Company> {
    const { data, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", error);
      throw error;
    }

    return data as Company;
  }

  /**
   * Delete a company
   */
  static async deleteCompany(companyId: string): Promise<void> {
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", companyId);

    if (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  }

  /**
   * Get company statistics
   */
  static async getCompanyStats() {
    const { data: totalCompanies } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true });

    const { data: clientCompanies } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("company_status", "cliente");

    const { data: targetAccounts } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .eq("is_target_account", true);

    const { data: dealsValue } = await supabase
      .from("deals")
      .select("deal_value");

    const totalDealsValue = dealsValue?.reduce((sum, deal) => sum + (deal.deal_value || 0), 0) || 0;

    return {
      totalCompanies: totalCompanies?.length || 0,
      clientCompanies: clientCompanies?.length || 0,
      targetAccounts: targetAccounts?.length || 0,
      totalDealsValue
    };
  }
}