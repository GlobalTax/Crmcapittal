import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company, CreateCompanyData, UpdateCompanyData, CompanyStatus, CompanyType } from "@/types/Company";
import { toast } from "sonner";

interface UseCompaniesOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
}

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 25, searchTerm = "", statusFilter = "all", typeFilter = "all" } = options;

  const {
    data: companiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies", page, limit, searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      console.log("🔍 Fetching companies with filters:", { searchTerm, statusFilter, typeFilter, page, limit });
      
      // Base query for companies
      let query = supabase
        .from("companies")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      if (statusFilter !== "all") {
        query = query.eq("company_status", statusFilter as CompanyStatus);
      }
      
      if (typeFilter !== "all") {
        query = query.eq("company_type", typeFilter as CompanyType);
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

      // Enrich companies with additional data (with error handling)
      const enrichedCompanies = await Promise.all(
        (data || []).map(async (company) => {
          try {
            // Get enrichment data
            const { data: enrichmentData, error: enrichmentError } = await supabase
              .from("company_enrichments")
              .select("enrichment_data")
              .eq("company_id", company.id)
              .limit(1)
              .maybeSingle();

            if (enrichmentError) {
              console.warn("⚠️ Enrichment data error for company", company.id, enrichmentError);
            }

            // Count contacts
            const { count: contactsCount, error: contactsError } = await supabase
              .from("contacts")
              .select("*", { count: "exact", head: true })
              .eq("company_id", company.id);

            if (contactsError) {
              console.warn("⚠️ Contacts count error for company", company.id, contactsError);
            }

            // Count active opportunities - use status instead of is_active since column doesn't exist
            const { count: opportunitiesCount, error: opportunitiesError } = await supabase
              .from("opportunities")
              .select("*", { count: "exact", head: true })
              .eq("company_id", company.id)
              .neq("status", "closed");

            if (opportunitiesError) {
              console.warn("⚠️ Opportunities count error for company", company.id, opportunitiesError);
            }

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
            // Return basic company data without enrichment if there's an error
            return {
              ...company,
              contacts_count: 0,
              opportunities_count: 0,
              profile_score: 15, // Just for having a name
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
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Separate query for getting counts when needed
  const useCompanyStats = () => {
    return useQuery({
      queryKey: ["company-stats"],
      queryFn: async () => {
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
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: CreateCompanyData) => {
      console.log("🏢 Creating company with data:", companyData);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("❌ User authentication error:", userError);
        throw new Error("Usuario no autenticado");
      }
      
      console.log("👤 User authenticated:", user.id);
      
      const { data, error } = await supabase
        .from("companies")
        .insert([
          {
            ...companyData,
            created_by: user.id,
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

      return data;
    },
    onSuccess: (data) => {
      console.log("🎉 Company creation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
      toast.success("Empresa creada exitosamente");
    },
    onError: (error: any) => {
      console.error("❌ Company creation failed:", error);
      
      // Better error handling
      let errorMessage = "Error al crear la empresa";
      if (error?.message?.includes("violates row-level security")) {
        errorMessage = "No tienes permisos para crear empresas";
      } else if (error?.message?.includes("duplicate key")) {
        errorMessage = "Ya existe una empresa con ese nombre";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCompanyData & { id: string }) => {
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

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
      toast.success("Empresa actualizada exitosamente");
    },
    onError: (error) => {
      console.error("Error updating company:", error);
      toast.error("Error al actualizar la empresa");
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (companyId: string) => {
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", companyId);

      if (error) {
        console.error("Error deleting company:", error);
        throw error;
      }

      return companyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
      toast.success("Empresa eliminada exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting company:", error);
      toast.error("Error al eliminar la empresa");
    },
  });

  return {
    companies: companiesData?.companies || [],
    totalCount: companiesData?.totalCount || 0,
    currentPage: companiesData?.currentPage || 1,
    totalPages: companiesData?.totalPages || 1,
    isLoading,
    error,
    createCompany: createCompanyMutation.mutate,
    updateCompany: updateCompanyMutation.mutate,
    deleteCompany: deleteCompanyMutation.mutate,
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
    useCompanyStats,
  };
};

export const useCompany = (companyId: string) => {
  return useQuery({
    queryKey: ["companies", companyId],
    queryFn: async () => {
      console.log("🏢 Fetching individual company:", companyId);
      
      if (!companyId) {
        throw new Error("Company ID is required");
      }

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
        console.error("❌ Error fetching company:", error);
        throw error;
      }

      console.log("✅ Successfully fetched company:", data?.name);
      return data as Company;
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};
