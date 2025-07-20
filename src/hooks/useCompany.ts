
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/Company";

export const useCompany = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (!companyId) {
        console.error("❌ Company ID is required but was:", companyId);
        throw new Error("Company ID is required");
      }

      console.log("🔍 [useCompany] Fetching company with ID:", companyId);
      
      // Simplified query - just get the basic company data
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) {
        console.error("❌ [useCompany] Error fetching company:", error);
        console.error("❌ [useCompany] Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (!data) {
        console.error("❌ [useCompany] No company data returned for ID:", companyId);
        throw new Error("Company not found");
      }

      console.log("✅ [useCompany] Successfully fetched company:", {
        id: data.id,
        name: data.name,
        domain: data.domain
      });

      // Try to get additional data but don't fail if it doesn't work
      try {
        console.log("🔍 [useCompany] Attempting to get contacts count...");
        const { count: contactsCount } = await supabase
          .from("contacts")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId);

        console.log("📊 [useCompany] Contacts count:", contactsCount);

        console.log("🔍 [useCompany] Attempting to get opportunities count...");
        const { count: opportunitiesCount } = await supabase
          .from("opportunities")
          .select("*", { count: "exact", head: true })
          .eq("company_id", companyId)
          .neq("status", "closed");

        console.log("📊 [useCompany] Opportunities count:", opportunitiesCount);

        console.log("🔍 [useCompany] Attempting to get enrichment data...");
        const { data: enrichmentData } = await supabase
          .from("company_enrichments")
          .select("enrichment_data")
          .eq("company_id", companyId)
          .limit(1)
          .maybeSingle();

        console.log("📊 [useCompany] Enrichment data found:", !!enrichmentData);

        const finalData = {
          ...data,
          enrichment_data: enrichmentData?.enrichment_data || null,
          contacts_count: contactsCount || 0,
          opportunities_count: opportunitiesCount || 0,
        } as Company;

        console.log("✅ [useCompany] Final company data prepared:", {
          id: finalData.id,
          name: finalData.name,
          contacts_count: finalData.contacts_count,
          opportunities_count: finalData.opportunities_count,
          has_enrichment: !!finalData.enrichment_data
        });

        return finalData;
      } catch (enrichError) {
        console.warn("⚠️ [useCompany] Error enriching company data:", enrichError);
        console.warn("⚠️ [useCompany] Returning basic company data without enrichment");
        
        // Return basic data if enrichment fails
        return {
          ...data,
          enrichment_data: null,
          contacts_count: 0,
          opportunities_count: 0,
        } as Company;
      }
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
