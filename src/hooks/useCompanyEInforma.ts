import { useState } from 'react';
import { einformaService } from '@/services/einformaService';
import { toast } from 'sonner';

export const useCompanyEInforma = () => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const enrichCompany = async (companyId: string, nif: string) => {
    if (!nif) {
      toast.error('Se requiere NIF/CIF para enriquecer con eInforma');
      return { success: false, error: 'NO_NIF' };
    }

    setIsEnriching(true);
    try {
      const result = await einformaService.enrichCompanyWithEInforma(nif);
      
      if (result.success) {
        toast.success(result.message);
        return { success: true, data: result.data };
      } else {
        toast.error(result.message || 'Error al enriquecer con eInforma');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error enriching company:', error);
      toast.error('Error al conectar con eInforma');
      return { success: false, error: 'CONNECTION_ERROR' };
    } finally {
      setIsEnriching(false);
    }
  };

  const searchByNif = async (nif: string) => {
    if (!nif) {
      toast.error('Ingrese un NIF/CIF válido');
      return { success: false, error: 'INVALID_NIF' };
    }

    setIsSearching(true);
    try {
      const result = await einformaService.enrichCompanyWithEInforma(nif);
      
      if (result.success && result.data) {
        return { 
          success: true, 
          data: {
            companyName: result.data.companyName,
            extractedData: result.data.extractedData,
            confidenceScore: result.data.confidenceScore
          }
        };
      } else {
        toast.error(result.message || 'No se encontraron datos para este NIF');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error searching by NIF:', error);
      toast.error('Error al buscar en eInforma');
      return { success: false, error: 'CONNECTION_ERROR' };
    } finally {
      setIsSearching(false);
    }
  };

  const validateNif = async (nif: string) => {
    return await einformaService.validateCIF(nif);
  };

  return {
    enrichCompany,
    searchByNif,
    validateNif,
    isEnriching,
    isSearching
  };
};