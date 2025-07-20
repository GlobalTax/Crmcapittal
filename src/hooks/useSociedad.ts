
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/Company";

export const useSociedad = (sociedadId: string) => {
  console.log("🏢 [useSociedad] Consultando sociedad:", sociedadId);

  return useQuery({
    queryKey: ["sociedad", sociedadId],
    queryFn: async () => {
      if (!sociedadId) {
        console.error("❌ [useSociedad] ID de sociedad no proporcionado");
        throw new Error("ID de sociedad requerido");
      }

      console.log("🔍 [useSociedad] Haciendo consulta para ID:", sociedadId);

      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", sociedadId)
        .single();

      if (error) {
        console.error("❌ [useSociedad] Error en consulta:", error);
        if (error.code === 'PGRST116') {
          throw new Error("Sociedad no encontrada");
        }
        throw error;
      }

      if (!data) {
        console.error("❌ [useSociedad] No se encontraron datos para ID:", sociedadId);
        throw new Error("Sociedad no encontrada");
      }

      console.log("✅ [useSociedad] Sociedad encontrada:", {
        id: data.id,
        name: data.name,
        hasData: !!data
      });

      return data as Company;
    },
    enabled: !!sociedadId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      if (error?.message === "Sociedad no encontrada") {
        return false;
      }
      return failureCount < 2;
    },
  });
};
