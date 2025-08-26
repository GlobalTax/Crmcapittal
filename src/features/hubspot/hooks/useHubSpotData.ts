import { useState, useEffect } from 'react';
import { HubSpotData, ImportResults } from '../types';
import { HubSpotService } from '../services/HubSpotService';
import { useToast } from '@/hooks/use-toast';

export const useHubSpotData = () => {
  const [data, setData] = useState<HubSpotData>({
    companies: [],
    contacts: [],
    deals: []
  });
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const hubspotData = await HubSpotService.fetchAllData();
      setData(hubspotData);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de HubSpot",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importData = async (importType: 'all' | 'companies' | 'contacts' | 'deals') => {
    try {
      setImporting(true);
      setImportResults(null);
      
      const results = await HubSpotService.importData(importType);
      setImportResults(results);
      
      toast({
        title: "Importación completada",
        description: `Se importaron ${results.companies + results.contacts + results.deals} registros exitosamente.`,
      });

      // Refresh data after import
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Error en la importación",
        description: error.message || "No se pudo completar la importación",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = HubSpotService.getStats(data);

  return {
    data,
    loading,
    importing,
    importResults,
    stats,
    fetchData,
    importData
  };
};