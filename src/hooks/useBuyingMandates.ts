
import { useState, useEffect, useRef } from 'react';
import { BuyingMandate, MandateTarget, MandateDocument, CreateBuyingMandateData, CreateMandateTargetData, CreateMandateDocumentData } from '@/types/BuyingMandate';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseBuyingMandatesResult {
  mandates: BuyingMandate[];
  targets: MandateTarget[];
  documents: MandateDocument[];
  isLoading: boolean;
  error: string | null;
  fetchMandates: (type?: string) => Promise<void>;
  fetchTargets: (mandateId: string) => Promise<void>;
  fetchDocuments: (mandateId: string) => Promise<void>;
  createMandate: (data: CreateBuyingMandateData) => Promise<BuyingMandate | null>;
  updateMandate: (id: string, updates: Partial<BuyingMandate>) => Promise<BuyingMandate | null>;
  deleteMandate: (id: string) => Promise<void>;
  createTarget: (data: CreateMandateTargetData) => Promise<MandateTarget | null>;
  updateTarget: (id: string, updates: Partial<MandateTarget>) => Promise<MandateTarget | null>;
  deleteTarget: (id: string) => Promise<void>;
  uploadDocument: (data: CreateMandateDocumentData, file: File) => Promise<MandateDocument | null>;
  deleteDocument: (id: string) => Promise<void>;
  updateMandateStatus: (id: string, status: string) => Promise<void>;
  importFromContacts: (mandateId: string, contactIds: string[]) => Promise<void>;
  importFromCompanies: (mandateId: string, companyIds: string[]) => Promise<void>;
  refetch: (type?: string) => Promise<void>;
}

export const useBuyingMandates = (mandateType?: string): UseBuyingMandatesResult => {
  const [mandates, setMandates] = useState<BuyingMandate[]>([]);
  const [targets, setTargets] = useState<MandateTarget[]>([]);
  const [documents, setDocuments] = useState<MandateDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadingMandates = useRef(false);
  const loadingTargets = useRef(false);
  const loadingDocuments = useRef(false);

  const fetchMandates = async (type: string = mandateType || '') => {
    if (loadingMandates.current) return;

    try {
      loadingMandates.current = true;
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('buying_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('mandate_type', type);
      }

      if (user) {
        query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Cast the data to match our type
      setMandates((data as any[])?.map(item => ({
        ...item,
        target_sectors: item.target_sectors || [],
        target_locations: item.target_locations || []
      })) || []);
    } catch (err: any) {
      console.error('Error fetching mandates:', err);
      setError(err.message || 'Failed to fetch mandates');
    } finally {
      setIsLoading(false);
      loadingMandates.current = false;
    }
  };
  
  const fetchTargets = async (mandateId: string) => {
    if (loadingTargets.current) return;
    
    try {
      loadingTargets.current = true;
      console.log('🎯 [fetchTargets] Iniciando fetch para mandato:', mandateId);
      
      const { data, error } = await supabase
        .from('mandate_targets')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [fetchTargets] Error:', error);
        throw error;
      }

      console.log('✅ [fetchTargets] Datos obtenidos:', data?.length || 0, 'targets');
      
      // Update targets for this specific mandate
      setTargets(prevTargets => {
        const otherTargets = prevTargets.filter(t => t.mandate_id !== mandateId);
        return [...otherTargets, ...(data || [])];
      });
      
    } catch (error) {
      console.error('❌ [fetchTargets] Error al obtener targets:', error);
    } finally {
      loadingTargets.current = false;
    }
  };

  const fetchDocuments = async (mandateId: string) => {
    if (loadingDocuments.current) return;
    
    try {
      loadingDocuments.current = true;
      console.log('📄 [fetchDocuments] Iniciando fetch para mandato:', mandateId);
      
      const { data, error } = await supabase
        .from('mandate_documents')
        .select('*')
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [fetchDocuments] Error:', error);
        throw error;
      }

      console.log('✅ [fetchDocuments] Datos obtenidos:', data?.length || 0, 'documentos');
      
      // Update documents for this specific mandate
      setDocuments(prevDocs => {
        const otherDocs = prevDocs.filter(d => d.mandate_id !== mandateId);
        return [...otherDocs, ...(data || [])];
      });
      
    } catch (error) {
      console.error('❌ [fetchDocuments] Error al obtener documentos:', error);
    } finally {
      loadingDocuments.current = false;
    }
  };

  const createMandate = async (data: CreateBuyingMandateData): Promise<BuyingMandate | null> => {
    try {
      const { data: newMandate, error } = await supabase
        .from('buying_mandates')
        .insert([{ ...data, created_by: user?.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMandates(prev => [newMandate, ...prev]);
      return newMandate;
    } catch (err: any) {
      console.error('Error creating mandate:', err);
      setError(err.message || 'Failed to create mandate');
      return null;
    }
  };

  const updateMandate = async (id: string, updates: Partial<BuyingMandate>): Promise<BuyingMandate | null> => {
    try {
      const { data: updatedMandate, error } = await supabase
        .from('buying_mandates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMandates(prev => prev.map(mandate => mandate.id === id ? { ...mandate, ...updatedMandate } : mandate));
      return updatedMandate;
    } catch (err: any) {
      console.error('Error updating mandate:', err);
      setError(err.message || 'Failed to update mandate');
      return null;
    }
  };

  const deleteMandate = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('buying_mandates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMandates(prev => prev.filter(mandate => mandate.id !== id));
    } catch (err: any) {
      console.error('Error deleting mandate:', err);
      setError(err.message || 'Failed to delete mandate');
    }
  };

  const updateMandateStatus = async (id: string, status: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('buying_mandates')
        .update({ status })
        .eq('id', id);

      if (error) {
        throw error;
      }

      setMandates(prev => prev.map(mandate => 
        mandate.id === id ? { ...mandate, status } : mandate
      ));
    } catch (err: any) {
      console.error('Error updating mandate status:', err);
      setError(err.message || 'Failed to update mandate status');
    }
  };

  const importFromContacts = async (mandateId: string, contactIds: string[]): Promise<void> => {
    try {
      // Implementation for importing contacts as targets
      console.log('Importing contacts:', contactIds, 'to mandate:', mandateId);
      // This would create mandate_targets based on selected contacts
    } catch (err: any) {
      console.error('Error importing from contacts:', err);
      setError(err.message || 'Failed to import from contacts');
    }
  };

  const importFromCompanies = async (mandateId: string, companyIds: string[]): Promise<void> => {
    try {
      // Implementation for importing companies as targets
      console.log('Importing companies:', companyIds, 'to mandate:', mandateId);
      // This would create mandate_targets based on selected companies
    } catch (err: any) {
      console.error('Error importing from companies:', err);
      setError(err.message || 'Failed to import from companies');
    }
  };

  const createTarget = async (data: CreateMandateTargetData): Promise<MandateTarget | null> => {
    try {
      const { data: newTarget, error } = await supabase
        .from('mandate_targets')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTargets(prev => [newTarget, ...prev]);
      return newTarget;
    } catch (err: any) {
      console.error('Error creating target:', err);
      setError(err.message || 'Failed to create target');
      return null;
    }
  };

  const updateTarget = async (id: string, updates: Partial<MandateTarget>): Promise<MandateTarget | null> => {
    try {
      const { data: updatedTarget, error } = await supabase
        .from('mandate_targets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setTargets(prev => prev.map(target => target.id === id ? { ...target, ...updatedTarget } : target));
      return updatedTarget;
    } catch (err: any) {
      console.error('Error updating target:', err);
      setError(err.message || 'Failed to update target');
      return null;
    }
  };

  const deleteTarget = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('mandate_targets')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setTargets(prev => prev.filter(target => target.id !== id));
    } catch (err: any) {
      console.error('Error deleting target:', err);
      setError(err.message || 'Failed to delete target');
    }
  };

  const uploadDocument = async (data: CreateMandateDocumentData, file: File): Promise<MandateDocument | null> => {
    try {
      // Upload file to Supabase storage
      const filePath = `mandate_documents/${data.mandate_id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('mandate-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of the uploaded file
      const { data: fileData } = supabase.storage
        .from('mandate-documents')
        .getPublicUrl(filePath);

      if (!fileData?.publicUrl) {
        throw new Error('Failed to retrieve public URL for the uploaded file');
      }

      // Create document record in Supabase table
      const { data: newDocument, error: createError } = await supabase
        .from('mandate_documents')
        .insert([{ ...data, file_url: fileData.publicUrl, file_size: file.size, content_type: file.type }])
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err.message || 'Failed to upload document');
      return null;
    }
  };

  const deleteDocument = async (id: string): Promise<void> => {
    try {
      // Get the document to retrieve file_url
      const { data: documentToDelete, error: getError } = await supabase
        .from('mandate_documents')
        .select('file_url')
        .eq('id', id)
        .single();

      if (getError) {
        throw getError;
      }

      if (!documentToDelete) {
        throw new Error('Document not found');
      }

      // Extract file path from file_url
      const filePath = documentToDelete.file_url.replace(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mandate-documents/`, '');

      // Delete file from Supabase storage
      const { error: deleteStorageError } = await supabase.storage
        .from('mandate-documents')
        .remove([filePath]);

      if (deleteStorageError) {
        console.error('Error deleting file from storage:', deleteStorageError);
        // Consider whether to throw an error or just log it
      }

      // Delete document record from Supabase table
      const { error: deleteError } = await supabase
        .from('mandate_documents')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      setDocuments(prev => prev.filter(document => document.id !== id));
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.message || 'Failed to delete document');
    }
  };

  useEffect(() => {
    fetchMandates(mandateType);
  }, [user, mandateType]);

  const refetch = async (type?: string) => {
    await fetchMandates(type || mandateType);
  };

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
    updateMandate,
    deleteMandate,
    createTarget,
    updateTarget,
    deleteTarget,
    uploadDocument,
    deleteDocument,
    updateMandateStatus,
    importFromContacts,
    importFromCompanies,
    refetch
  };
};
