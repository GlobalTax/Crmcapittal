/**
 * Companies Hook
 * 
 * Main hook for companies CRUD operations and state management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company, CreateCompanyData, UpdateCompanyData, UseCompaniesOptions } from '../types';
import { CompanyService } from '../services/CompanyService';
import { toast } from "sonner";

export const useCompanies = (options: UseCompaniesOptions = {}) => {
  const queryClient = useQueryClient();

  const {
    data: companiesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["companies", options.page, options.limit, options.searchTerm, options.statusFilter, options.typeFilter],
    queryFn: () => CompanyService.fetchCompanies(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Company stats hook
  const useCompanyStats = () => {
    return useQuery({
      queryKey: ["company-stats"],
      queryFn: () => CompanyService.getCompanyStats(),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: CreateCompanyData) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("Usuario no autenticado");
      }
      
      return CompanyService.createCompany(companyData, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company-stats"] });
      toast.success("Empresa creada exitosamente");
    },
    onError: (error: any) => {
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
      return CompanyService.updateCompany(id, updateData);
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
    mutationFn: (companyId: string) => CompanyService.deleteCompany(companyId),
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
    queryFn: () => CompanyService.fetchCompanyById(companyId),
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};