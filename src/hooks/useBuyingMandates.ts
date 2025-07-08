import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BuyingMandate, 
  CreateBuyingMandateData, 
  MandateTarget, 
  CreateMandateTargetData,
  MandateDocument,
  CreateMandateDocumentData,
  MandateComment,
  MandateClientAccess,
  CreateClientAccessData
} from '@/types/BuyingMandate';

export const useBuyingMandates = () => {
  const [mandates, setMandates] = useState<BuyingMandate[]>([]);
  const [targets, setTargets] = useState<MandateTarget[]>([]);
  const [documents, setDocuments] = useState<MandateDocument[]>([]);
  const [comments, setComments] = useState<MandateComment[]>([]);
  const [clientAccess, setClientAccess] = useState<MandateClientAccess[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMandates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('buying_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMandates((data || []) as BuyingMandate[]);
    } catch (error) {
      console.error('Error fetching mandates:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mandatos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchTargets = useCallback(async (mandateId?: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('mandate_targets')
        .select('*')
        .order('created_at', { ascending: false });

      if (mandateId) {
        query = query.eq('mandate_id', mandateId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTargets((data || []) as MandateTarget[]);
    } catch (error) {
      console.error('Error fetching targets:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los targets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createMandate = async (mandateData: CreateBuyingMandateData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('buying_mandates')
        .insert({
          ...mandateData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Mandato creado correctamente',
      });

      await fetchMandates();
      return data;
    } catch (error) {
      console.error('Error creating mandate:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el mandato',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const createTarget = async (targetData: CreateMandateTargetData) => {
    console.log('🚀 [useBuyingMandates] createTarget iniciado');
    console.log('📋 [useBuyingMandates] targetData:', targetData);
    
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('👤 [useBuyingMandates] Usuario autenticado:', user?.id);
      
      if (authError) {
        console.error('❌ [useBuyingMandates] Error de autenticación:', authError);
        throw authError;
      }
      
      if (!user) {
        console.error('❌ [useBuyingMandates] Usuario no autenticado');
        throw new Error('Usuario no autenticado');
      }

      // Preparar datos para inserción
      const insertData = {
        ...targetData,
        created_by: user.id,
      };
      
      console.log('📤 [useBuyingMandates] Datos a insertar:', insertData);

      // Verificar que mandate_id existe
      const { data: mandate, error: mandateError } = await supabase
        .from('buying_mandates')
        .select('id')
        .eq('id', targetData.mandate_id)
        .single();

      if (mandateError || !mandate) {
        console.error('❌ [useBuyingMandates] Mandato no encontrado:', mandateError);
        throw new Error('El mandato especificado no existe');
      }

      console.log('✅ [useBuyingMandates] Mandato verificado:', mandate.id);

      // Insertar target
      const { data, error } = await supabase
        .from('mandate_targets')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ [useBuyingMandates] Error de Supabase:', error);
        console.error('❌ [useBuyingMandates] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [useBuyingMandates] Target creado exitosamente:', data);

      toast({
        title: 'Éxito',
        description: 'Target añadido correctamente',
      });

      // Refrescar lista de targets
      await fetchTargets(targetData.mandate_id);
      return data;
    } catch (error: any) {
      console.error('💥 [useBuyingMandates] Error creating target:', error);
      
      let errorMessage = 'No se pudo crear el target';
      
      if (error.message?.includes('autenticado')) {
        errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      } else if (error.message?.includes('row-level security')) {
        errorMessage = 'Sin permisos para crear targets en este mandato.';
      } else if (error.code === '23505') {
        errorMessage = 'Ya existe un target con esa información.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTarget = async (targetId: string, updates: Partial<MandateTarget>) => {
    try {
      const { error } = await supabase
        .from('mandate_targets')
        .update(updates)
        .eq('id', targetId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Target actualizado correctamente',
      });

      const target = targets.find(t => t.id === targetId);
      if (target) {
        await fetchTargets(target.mandate_id);
      }
    } catch (error) {
      console.error('Error updating target:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el target',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMandateStatus = async (mandateId: string, status: BuyingMandate['status']) => {
    try {
      const { error } = await supabase
        .from('buying_mandates')
        .update({ status })
        .eq('id', mandateId);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Estado del mandato actualizado',
      });

      await fetchMandates();
    } catch (error) {
      console.error('Error updating mandate status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del mandato',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Document management functions
  const fetchDocuments = useCallback(async (mandateId?: string, targetId?: string) => {
    try {
      let query = supabase
        .from('mandate_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (mandateId) {
        query = query.eq('mandate_id', mandateId);
      }
      if (targetId) {
        query = query.eq('target_id', targetId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDocuments((data || []) as MandateDocument[]);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los documentos',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const uploadDocument = async (documentData: CreateMandateDocumentData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('mandate_documents')
        .insert({
          ...documentData,
          uploaded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Documento subido correctamente',
      });

      await fetchDocuments(documentData.mandate_id);
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el documento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Comments management
  const fetchComments = async (mandateId?: string, targetId?: string) => {
    try {
      let query = supabase
        .from('mandate_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (mandateId) {
        query = query.eq('mandate_id', mandateId);
      }
      if (targetId) {
        query = query.eq('target_id', targetId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setComments((data || []) as MandateComment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async (mandateId: string, targetId: string | undefined, text: string, type: MandateComment['comment_type']) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('mandate_comments')
        .insert({
          mandate_id: mandateId,
          target_id: targetId,
          comment_text: text,
          comment_type: type,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchComments(mandateId, targetId);
      return data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  // Client access management
  const createClientAccess = async (accessData: CreateClientAccessData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Generate unique access token
      const accessToken = crypto.randomUUID();

      const { data, error } = await supabase
        .from('mandate_client_access')
        .insert({
          ...accessData,
          access_token: accessToken,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Acceso de cliente creado correctamente',
      });

      return data;
    } catch (error) {
      console.error('Error creating client access:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el acceso de cliente',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Import from CRM functions
  const importFromContacts = async (mandateId: string, contactIds: string[]) => {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .in('id', contactIds);

      if (error) throw error;

      const targetsToCreate = contacts.map(contact => ({
        mandate_id: mandateId,
        company_name: contact.company || contact.name,
        contact_name: contact.name,
        contact_email: contact.email,
        contact_phone: contact.phone,
        notes: `Importado desde contactos CRM: ${contact.name}`,
      }));

      const { data, error: insertError } = await supabase
        .from('mandate_targets')
        .insert(targetsToCreate)
        .select();

      if (insertError) throw insertError;

      toast({
        title: 'Éxito',
        description: `${data.length} targets importados desde contactos`,
      });

      await fetchTargets(mandateId);
      return data;
    } catch (error) {
      console.error('Error importing from contacts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron importar los contactos',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const importFromCompanies = async (mandateId: string, companyIds: string[]) => {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      if (error) throw error;

      const targetsToCreate = companies.map(company => ({
        mandate_id: mandateId,
        company_name: company.name,
        sector: company.industry,
        location: `${company.city || ''} ${company.country || ''}`.trim(),
        revenues: company.annual_revenue,
        notes: `Importado desde empresas CRM: ${company.name}`,
      }));

      const { data, error: insertError } = await supabase
        .from('mandate_targets')
        .insert(targetsToCreate)
        .select();

      if (insertError) throw insertError;

      toast({
        title: 'Éxito',
        description: `${data.length} targets importados desde empresas`,
      });

      await fetchTargets(mandateId);
      return data;
    } catch (error) {
      console.error('Error importing from companies:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron importar las empresas',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMandates();
  }, [fetchMandates]);

  return {
    mandates,
    targets,
    documents,
    comments,
    clientAccess,
    isLoading,
    fetchMandates,
    fetchTargets,
    fetchDocuments,
    fetchComments,
    createMandate,
    createTarget,
    updateTarget,
    updateMandateStatus,
    uploadDocument,
    addComment,
    createClientAccess,
    importFromContacts,
    importFromCompanies,
  };
};