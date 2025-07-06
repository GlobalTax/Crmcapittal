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
      // Base query for companies with counts
      let query = supabase
        .from("companies")
        .select(`
          *,
          company_enrichments(enrichment_data),
          contacts(count),
          opportunities(count)
        `)
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
        console.error("Error fetching companies:", error);
        throw error;
      }

      // Process the data to include enrichment info and counts
      const processedCompanies = (data as any[])?.map((company) => {
        const enrichmentData = company.company_enrichments?.[0]?.enrichment_data;
        return {
          ...company,
          enrichment_data: enrichmentData,
          contacts_count: Array.isArray(company.contacts) ? company.contacts.length : 0,
          opportunities_count: Array.isArray(company.opportunities) ? company.opportunities.length : 0,
          sector: enrichmentData?.company_data?.actividad_principal || company.industry,
        };
      }) || [];

      return {
        companies: processedCompanies as Company[],
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
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("companies")
        .insert([
          {
            ...companyData,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating company:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
      toast.success("Empresa creada exitosamente");
    },
    onError: (error) => {
      console.error("Error creating company:", error);
      toast.error("Error al crear la empresa");
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
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};
