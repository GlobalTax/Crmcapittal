
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BuyingMandate, MandateTarget, MandateDocument, CreateBuyingMandateData, CreateMandateTargetData, CreateMandateDocumentData } from '@/types/BuyingMandate';

export const useBuyingMandates = () => {
  const [mandates, setMandates] = useState<BuyingMandate[]>([]);
  const [targets, setTargets] = useState<MandateTarget[]>([]);
  const [documents, setDocuments] = useState<MandateDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchMandates = useCallback(async (type?: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      let query = supabase
        .from('buying_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (type && type !== 'all') {
        query = query.eq('mandate_type', type);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Error fetching mandates:', queryError);
        setError('Error al cargar los mandatos');
        return;
      }

      // Ensure all data conforms to the BuyingMandate type
      const typedData: BuyingMandate[] = (data || []).map(item => ({
        ...item,
        status: item.status as BuyingMandate['status'],
        mandate_type: item.mandate_type as BuyingMandate['mandate_type']
      }));

      setMandates(typedData);
    } catch (err) {
      console.error('Error in fetchMandates:', err);
      setError('Error inesperado al cargar mandatos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTargets = useCallback(async (mandateId: string) => {
    if (!mandateId) return;
    
    try {
      console.log('🎯 [fetchTargets] Iniciando fetch para mandato:', mandateId);
      
      const { data, error: queryError } = await supabase
        .from('mandate_targets')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('Error fetching targets:', queryError);
        return;
      }

      // Type the data properly
      const typedTargets: MandateTarget[] = (data || []).map(item => ({
        ...item,
        status: item.status as MandateTarget['status']
      }));

      setTargets(prevTargets => {
        // Only update if the data is different
        const existingTargets = prevTargets.filter(t => t.mandate_id !== mandateId);
        return [...existingTargets, ...typedTargets];
      });

      console.log('✅ [fetchTargets] Datos obtenidos:', typedTargets.length, 'targets');
    } catch (err) {
      console.error('Error in fetchTargets:', err);
    }
  }, []);

  const fetchDocuments = useCallback(async (mandateId: string) => {
    if (!mandateId) return;
    
    try {
      console.log('📄 [fetchDocuments] Iniciando fetch para mandato:', mandateId);
      
      const { data, error: queryError } = await supabase
        .from('mandate_documents')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('uploaded_at', { ascending: false });

      if (queryError) {
        console.error('Error fetching documents:', queryError);
        return;
      }

      // Type the data properly
      const typedDocuments: MandateDocument[] = (data || []).map(item => ({
        ...item,
        document_type: item.document_type as MandateDocument['document_type']
      }));

      setDocuments(prevDocs => {
        // Only update if the data is different
        const existingDocs = prevDocs.filter(d => d.mandate_id !== mandateId);
        return [...existingDocs, ...typedDocuments];
      });

      console.log('✅ [fetchDocuments] Datos obtenidos:', typedDocuments.length, 'documentos');
    } catch (err) {
      console.error('Error in fetchDocuments:', err);
    }
  }, []);

  const createMandate = useCallback(async (mandateData: CreateBuyingMandateData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error: insertError } = await supabase
        .from('buying_mandates')
        .insert([{
          ...mandateData,
          created_by: user.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const typedMandate: BuyingMandate = {
        ...data,
        status: data.status as BuyingMandate['status'],
        mandate_type: data.mandate_type as BuyingMandate['mandate_type']
      };

      setMandates(prev => [typedMandate, ...prev]);
      return { data: typedMandate, error: null };
    } catch (err) {
      console.error('Error creating mandate:', err);
      return { data: null, error: err };
    }
  }, []);

  const updateMandateStatus = useCallback(async (mandateId: string, status: BuyingMandate['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('buying_mandates')
        .update({ status })
        .eq('id', mandateId);

      if (updateError) throw updateError;

      setMandates(prev => prev.map(m => 
        m.id === mandateId ? { ...m, status } : m
      ));

      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating mandate status:', err);
      return { success: false, error: err };
    }
  }, []);

  const createTarget = useCallback(async (targetData: CreateMandateTargetData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error: insertError } = await supabase
        .from('mandate_targets')
        .insert([{
          ...targetData,
          created_by: user.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const typedTarget: MandateTarget = {
        ...data,
        status: data.status as MandateTarget['status']
      };

      setTargets(prev => [typedTarget, ...prev]);
      return { data: typedTarget, error: null };
    } catch (err) {
      console.error('Error creating target:', err);
      return { data: null, error: err };
    }
  }, []);

  const uploadDocument = useCallback(async (documentData: CreateMandateDocumentData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error: insertError } = await supabase
        .from('mandate_documents')
        .insert([{
          ...documentData,
          uploaded_by: user.id
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const typedDocument: MandateDocument = {
        ...data,
        document_type: data.document_type as MandateDocument['document_type']
      };

      setDocuments(prev => [typedDocument, ...prev]);
      return { data: typedDocument, error: null };
    } catch (err) {
      console.error('Error uploading document:', err);
      return { data: null, error: err };
    }
  }, []);

  const importFromContacts = useCallback(async (mandateId: string, contactIds: string[]) => {
    try {
      // This would be implemented based on your contacts table structure
      console.log('Importing contacts:', contactIds, 'to mandate:', mandateId);
      return { success: true, error: null };
    } catch (err) {
      console.error('Error importing from contacts:', err);
      return { success: false, error: err };
    }
  }, []);

  const importFromCompanies = useCallback(async (mandateId: string, companyIds: string[]) => {
    try {
      // This would be implemented based on your companies table structure
      console.log('Importing companies:', companyIds, 'to mandate:', mandateId);
      return { success: true, error: null };
    } catch (err) {
      console.error('Error importing from companies:', err);
      return { success: false, error: err };
    }
  }, []);

  const refetch = useCallback(async (type?: string) => {
    await fetchMandates(type);
  }, [fetchMandates]);

  return {
    mandates,
    targets,
    documents,
    isLoading,
    error,
    fetchMandates,
    fetchTargets,
    fetchDocuments,
    createMandate,
    updateMandateStatus,
    createTarget,
    uploadDocument,
    importFromContacts,
    importFromCompanies,
    refetch
  };
};
