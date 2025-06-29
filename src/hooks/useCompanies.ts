
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company, CreateCompanyData, UpdateCompanyData } from "@/types/Company";
import { toast } from "sonner";

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const {
    data: companies = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          contacts_count:contacts(count),
          deals_count:deals(count)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching companies:", error);
        throw error;
      }

      return data as Company[];
    },
  });

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
      toast.success("Empresa eliminada exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting company:", error);
      toast.error("Error al eliminar la empresa");
    },
  });

  return {
    companies,
    isLoading,
    error,
    createCompany: createCompanyMutation.mutate,
    updateCompany: updateCompanyMutation.mutate,
    deleteCompany: deleteCompanyMutation.mutate,
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
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
  });
};
