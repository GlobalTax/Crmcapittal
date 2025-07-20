
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company, CreateCompanyData, UpdateCompanyData } from "@/types/Company";
import { toast } from "sonner";

interface UseSociedadesOptions {
  page?: number;
  limit?: number;
  searchTerm?: string;
  statusFilter?: string;
  typeFilter?: string;
}

export const useSociedades = (options: UseSociedadesOptions = {}) => {
  const queryClient = useQueryClient();
  const { page = 1, limit = 25, searchTerm = "", statusFilter = "all", typeFilter = "all" } = options;

  console.log("🏢 [useSociedades] Iniciando con opciones:", { page, limit, searchTerm, statusFilter, typeFilter });

  const {
    data: sociedadesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sociedades", page, limit, searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      console.log("🔍 [useSociedades] Haciendo consulta a Supabase");
      
      let query = supabase
        .from("companies")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      // Aplicar filtros de búsqueda
      if (searchTerm) {
        console.log("🔍 [useSociedades] Aplicando filtro de búsqueda:", searchTerm);
        query = query.or(`name.ilike.%${searchTerm}%,domain.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`);
      }
      
      // Aplicar filtro de estado
      if (statusFilter !== "all") {
        console.log("🔍 [useSociedades] Aplicando filtro de estado:", statusFilter);
        query = query.eq("company_status", statusFilter);
      }
      
      // Aplicar filtro de tipo
      if (typeFilter !== "all") {
        console.log("🔍 [useSociedades] Aplicando filtro de tipo:", typeFilter);
        query = query.eq("company_type", typeFilter);
      }

      // Aplicar paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("❌ [useSociedades] Error en consulta:", error);
        throw error;
      }

      console.log("✅ [useSociedades] Datos obtenidos:", {
        count: data?.length || 0,
        total: count,
        firstItem: data?.[0]?.name
      });

      return {
        sociedades: data as Company[],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  const createSociedadMutation = useMutation({
    mutationFn: async (sociedadData: CreateCompanyData) => {
      console.log("🏢 [useSociedades] Creando nueva sociedad:", sociedadData.name);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("❌ [useSociedades] Error de autenticación:", userError);
        throw new Error("Usuario no autenticado");
      }
      
      const { data, error } = await supabase
        .from("companies")
        .insert([
          {
            ...sociedadData,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ [useSociedades] Error creando sociedad:", error);
        throw error;
      }

      console.log("✅ [useSociedades] Sociedad creada:", data.id);
      return data;
    },
    onSuccess: (data) => {
      console.log("🎉 [useSociedades] Sociedad creada exitosamente, invalidando queries");
      queryClient.invalidateQueries({ queryKey: ["sociedades"] });
      toast.success("Sociedad creada exitosamente");
    },
    onError: (error: any) => {
      console.error("❌ [useSociedades] Error al crear sociedad:", error);
      toast.error("Error al crear la sociedad");
    },
  });

  const updateSociedadMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateCompanyData & { id: string }) => {
      console.log("📝 [useSociedades] Actualizando sociedad:", id);
      
      const { data, error } = await supabase
        .from("companies")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("❌ [useSociedades] Error actualizando sociedad:", error);
        throw error;
      }

      console.log("✅ [useSociedades] Sociedad actualizada:", id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sociedades"] });
      toast.success("Sociedad actualizada exitosamente");
    },
    onError: (error) => {
      console.error("❌ [useSociedades] Error al actualizar sociedad:", error);
      toast.error("Error al actualizar la sociedad");
    },
  });

  const deleteSociedadMutation = useMutation({
    mutationFn: async (sociedadId: string) => {
      console.log("🗑️ [useSociedades] Eliminando sociedad:", sociedadId);
      
      const { error } = await supabase
        .from("companies")
        .delete()
        .eq("id", sociedadId);

      if (error) {
        console.error("❌ [useSociedades] Error eliminando sociedad:", error);
        throw error;
      }

      console.log("✅ [useSociedades] Sociedad eliminada:", sociedadId);
      return sociedadId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sociedades"] });
      toast.success("Sociedad eliminada exitosamente");
    },
    onError: (error) => {
      console.error("❌ [useSociedades] Error al eliminar sociedad:", error);
      toast.error("Error al eliminar la sociedad");
    },
  });

  return {
    sociedades: sociedadesData?.sociedades || [],
    totalCount: sociedadesData?.totalCount || 0,
    currentPage: sociedadesData?.currentPage || 1,
    totalPages: sociedadesData?.totalPages || 1,
    isLoading,
    error,
    createSociedad: createSociedadMutation.mutate,
    updateSociedad: updateSociedadMutation.mutate,
    deleteSociedad: deleteSociedadMutation.mutate,
    isCreating: createSociedadMutation.isPending,
    isUpdating: updateSociedadMutation.isPending,
    isDeleting: deleteSociedadMutation.isPending,
  };
};
