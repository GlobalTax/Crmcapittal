
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/Company";

export const useCompany = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      console.log("🔍 Fetching company with ID:", companyId);
      
      const { data, error } = await supabase
        .from("companies")
        .select(`
          *,
          company_enrichments!inner(enrichment_data)
        `)
        .eq("id", companyId)
        .single();

      if (error) {
        console.error("❌ Error fetching company:", error);
        throw error;
      }

      console.log("✅ Successfully fetched company:", data?.name);

      // Enrich with additional data
      try {
        // Get contacts count
        const { count: contactsCount } = await supabase
          .from("contacts")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId);

        // Get opportunities count
        const { count: opportunitiesCount } = await supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId)
          .neq("status", "closed");

        const enrichmentData = data.company_enrichments?.[0]?.enrichment_data;

        return {
          ...data,
          enrichment_data: enrichmentData,
          contacts_count: contactsCount || 0,
          opportunities_count: opportunitiesCount || 0,
        } as Company;
      } catch (enrichError) {
        console.warn("⚠️ Error enriching company data:", enrichError);
        return data as Company;
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
