import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EinformaDisplayData {
  sector?: string;
  ubicacion?: string;
  ingresos?: number;
  empleados?: number;
  anoConstitucion?: string;
  cnae?: string;
  cnaDescripcion?: string;
  patrimonioNeto?: number;
  fechaActualizacion?: string;
}

export const useCompanyEnrichments = (companyId: string) => {
  const [enrichmentData, setEnrichmentData] = useState<EinformaDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrichmentData = async () => {
      if (!companyId) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('company_enrichments')
          .select('*')
          .eq('company_id', companyId)
          .eq('source', 'einforma')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching enrichment data:', error);
          setError('Error al cargar datos de eInforma');
          return;
        }

        if (!data) {
          setEnrichmentData(null);
          return;
        }

        // Extract and format data from enrichment_data JSON
        const rawData = data.enrichment_data as any;
        const companyData = rawData?.company_data;
        const financialData = rawData?.financial_data?.[0]; // Most recent financial data

        const formattedData: EinformaDisplayData = {
          sector: companyData?.actividad_principal,
          ubicacion: [companyData?.poblacion, companyData?.provincia]
            .filter(Boolean)
            .join(', '),
          ingresos: financialData?.ingresos_explotacion,
          empleados: financialData?.empleados,
          anoConstitucion: companyData?.fecha_constitucion 
            ? new Date(companyData.fecha_constitucion).getFullYear().toString()
            : undefined,
          cnae: companyData?.cnae,
          patrimonioNeto: financialData?.patrimonio_neto,
          fechaActualizacion: data.enrichment_date
        };

        setEnrichmentData(formattedData);
      } catch (err) {
        console.error('Error fetching enrichment data:', err);
        setError('Error inesperado al cargar datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrichmentData();
  }, [companyId]);

  return { enrichmentData, isLoading, error };
};