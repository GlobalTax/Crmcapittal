import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  BuyingMandate, 
  MandateTarget, 
  MandateDocument,
  MandateComment,
  MandateClientAccess
} from '@/types/BuyingMandate';

export const useClientMandateAccess = (mandateId: string) => {
  const [searchParams] = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [mandate, setMandate] = useState<BuyingMandate | null>(null);
  const [targets, setTargets] = useState<MandateTarget[]>([]);
  const [documents, setDocuments] = useState<MandateDocument[]>([]);
  const [comments, setComments] = useState<MandateComment[]>([]);
  const [clientAccess, setClientAccess] = useState<MandateClientAccess | null>(null);
  const { toast } = useToast();

  const token = searchParams.get('token');

  const validateAccess = async () => {
    if (!token) {
      setHasAccess(false);
      setIsValidating(false);
      return;
    }

    try {
      // Validate token and get client access record
      const { data: accessData, error: accessError } = await supabase
        .from('mandate_client_access')
        .select('*')
        .eq('access_token', token)
        .eq('mandate_id', mandateId)
        .eq('is_active', true)
        .single();

      if (accessError || !accessData) {
        throw new Error('Token inválido o expirado');
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(accessData.expires_at);
      if (now > expiresAt) {
        throw new Error('El acceso ha expirado');
      }

      setClientAccess(accessData);
      setHasAccess(true);

      // Update last accessed timestamp
      await supabase
        .from('mandate_client_access')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', accessData.id);

    } catch (error) {
      console.error('Access validation error:', error);
      setHasAccess(false);
      toast({
        title: 'Acceso denegado',
        description: error instanceof Error ? error.message : 'Token de acceso inválido',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const fetchMandateData = async () => {
    if (!hasAccess) return;

    try {
      // Fetch mandate (basic info only, no sensitive data)
      const { data: mandateData, error: mandateError } = await supabase
        .from('buying_mandates')
        .select(`
          id,
          mandate_name,
          client_name,
          client_contact,
          target_sectors,
          target_locations,
          status,
          start_date,
          end_date,
          assigned_user_id,
          created_at,
          updated_at
        `)
        .eq('id', mandateId)
        .single();

      if (mandateError) throw mandateError;
      
      // Fetch assigned user profile if exists
      let assignedUserName = undefined;
      if (mandateData.assigned_user_id) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name')
          .eq('id', mandateData.assigned_user_id)
          .single();
        
        if (userProfile) {
          assignedUserName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
        }
      }
      
      // Transform data to include assigned_user_name
      const transformedMandate = {
        ...mandateData,
        assigned_user_name: assignedUserName,
      };
      
      setMandate(transformedMandate as BuyingMandate);

      // Fetch targets (limited fields, no sensitive financial data)
      const { data: targetsData, error: targetsError } = await supabase
        .from('mandate_targets')
        .select(`
          id,
          company_name,
          sector,
          location,
          contacted,
          contact_date,
          status,
          created_at
        `)
        .eq('mandate_id', mandateId)
        .order('created_at', { ascending: false });

      if (targetsError) throw targetsError;
      setTargets((targetsData || []) as MandateTarget[]);

      // Fetch only client-visible comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('mandate_comments')
        .select('*')
        .eq('mandate_id', mandateId)
        .eq('is_client_visible', true)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      setComments((commentsData || []) as MandateComment[]);

      // Fetch only non-confidential documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('mandate_documents')
        .select('*')
        .eq('mandate_id', mandateId)
        .eq('is_confidential', false)
        .order('uploaded_at', { ascending: false });

      if (documentsError) throw documentsError;
      setDocuments((documentsData || []) as MandateDocument[]);

    } catch (error) {
      console.error('Error fetching mandate data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del mandato',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    validateAccess();
  }, [token, mandateId]);

  useEffect(() => {
    if (hasAccess) {
      fetchMandateData();
    }
  }, [hasAccess, mandateId]);

  return {
    isValidating,
    hasAccess,
    mandate,
    targets,
    documents,
    comments,
    clientAccess,
    refreshData: fetchMandateData,
  };
};