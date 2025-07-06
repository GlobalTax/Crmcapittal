import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyData {
  name: string;
  nif: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  business_sector?: string;
  legal_representative?: string;
  status: 'activo' | 'inactivo';
  client_type: 'empresa';
}

export interface CompanyLookupResult {
  success: boolean;
  data?: CompanyData;
  source?: 'einforma' | 'simulated';
  note?: string;
  error?: string;
}

export const useCompanyLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateNIF = (nif: string): boolean => {
    if (!nif || typeof nif !== 'string') return false;
    
    const cleanNif = nif.trim().toUpperCase();
    
    // CIF format: Letter + 7 digits + Letter/Digit
    const cifRegex = /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/;
    // NIF format: 8 digits + letter
    const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    // NIE format: X/Y/Z + 7 digits + letter
    const nieRegex = /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    
    return cifRegex.test(cleanNif) || nifRegex.test(cleanNif) || nieRegex.test(cleanNif);
  };

  const lookupCompany = async (nif: string): Promise<CompanyLookupResult> => {
    setIsLoading(true);
    setError('');

    try {
      // Validate NIF format
      if (!validateNIF(nif)) {
        setError('Formato de NIF/CIF inválido');
        return {
          success: false,
          error: 'Formato de NIF/CIF inválido'
        };
      }

      // Call the edge function
      const { data, error: functionError } = await supabase.functions.invoke(
        'company-lookup-einforma',
        {
          body: { nif: nif.trim().toUpperCase() }
        }
      );

      if (functionError) {
        console.error('Edge function error:', functionError);
        setError('Error al conectar con el servicio de búsqueda');
        return {
          success: false,
          error: 'Error al conectar con el servicio de búsqueda'
        };
      }

      if (data.success) {
        // Show appropriate message based on data source
        if (data.source === 'simulated') {
          if (data.note) {
            toast.info(data.note);
          } else {
            toast.info('Usando datos simulados para demostración');
          }
        } else {
          toast.success('Empresa encontrada en el Registro Mercantil');
        }

        return {
          success: true,
          data: data.data,
          source: data.source,
          note: data.note
        };
      } else {
        setError(data.error || 'Empresa no encontrada');
        return {
          success: false,
          error: data.error || 'Empresa no encontrada'
        };
      }

    } catch (error) {
      console.error('Company lookup error:', error);
      const errorMessage = 'Error al buscar la empresa';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lookupCompany,
    validateNIF,
    isLoading,
    error
  };
};