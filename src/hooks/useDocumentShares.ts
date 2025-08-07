import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentShare, ShareLinkConfig, DocumentAccessLog } from '@/types/DocumentPermissions';
import { useAuth } from '@/contexts/AuthContext';

export const useDocumentShares = (documentId?: string) => {
  const [shares, setShares] = useState<DocumentShare[]>([]);
  const [accessLogs, setAccessLogs] = useState<DocumentAccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchShares = async (docId: string) => {
    if (!docId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_shares')
        .select('*')
        .eq('document_id', docId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShares((data || []) as DocumentShare[]);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los enlaces compartidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessLogs = async (docId: string) => {
    if (!docId) return;
    
    try {
      const { data, error } = await supabase
        .from('document_access_logs')
        .select('*')
        .eq('document_id', docId)
        .order('accessed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAccessLogs((data || []) as DocumentAccessLog[]);
    } catch (error) {
      console.error('Error fetching access logs:', error);
    }
  };

  const createShareLink = async (documentId: string, config: ShareLinkConfig) => {
    try {
      const shareData: any = {
        document_id: documentId,
        share_type: config.shareType,
        watermark_enabled: config.watermarkEnabled,
        download_allowed: config.downloadAllowed,
        print_allowed: config.printAllowed,
        created_by: user?.id,
      };

      if (config.expiresAt) {
        shareData.expires_at = config.expiresAt.toISOString();
      }

      if (config.maxViews) {
        shareData.max_views = config.maxViews;
      }

      if (config.password) {
        // Hash the password (en un entorno real, usar bcrypt en el backend)
        shareData.password_hash = btoa(config.password);
      }

      const { data, error } = await supabase
        .from('document_shares')
        .insert(shareData)
        .select()
        .single();

      if (error) throw error;

      setShares(prev => [...prev, data as DocumentShare]);
      toast({
        title: "Éxito",
        description: "Enlace compartido creado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el enlace compartido",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateShareLink = async (shareId: string, updates: Partial<DocumentShare>) => {
    try {
      const { data, error } = await supabase
        .from('document_shares')
        .update(updates)
        .eq('id', shareId)
        .select()
        .single();

      if (error) throw error;

      setShares(prev => 
        prev.map(share => share.id === shareId ? { ...share, ...data as DocumentShare } : share)
      );

      toast({
        title: "Éxito",
        description: "Enlace actualizado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error updating share link:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el enlace",
        variant: "destructive",
      });
      return null;
    }
  };

  const revokeShareLink = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('document_shares')
        .update({ is_active: false })
        .eq('id', shareId);

      if (error) throw error;

      setShares(prev => prev.filter(share => share.id !== shareId));
      toast({
        title: "Éxito",
        description: "Enlace revocado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error revoking share link:', error);
      toast({
        title: "Error",
        description: "No se pudo revocar el enlace",
        variant: "destructive",
      });
      return false;
    }
  };

  const logAccess = async (
    documentId: string, 
    accessType: string = 'view',
    shareId?: string,
    sessionDuration?: number
  ) => {
    try {
      const { data, error } = await supabase.rpc('log_document_access', {
        p_document_id: documentId,
        p_share_id: shareId,
        p_access_type: accessType,
        p_session_duration: sessionDuration,
        p_metadata: {
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging access:', error);
      return null;
    }
  };

  const generateShareUrl = (shareToken: string) => {
    return `${window.location.origin}/shared/${shareToken}`;
  };

  useEffect(() => {
    if (documentId) {
      fetchShares(documentId);
      fetchAccessLogs(documentId);
    }
  }, [documentId]);

  return {
    shares,
    accessLogs,
    loading,
    createShareLink,
    updateShareLink,
    revokeShareLink,
    logAccess,
    generateShareUrl,
    refetch: () => {
      if (documentId) {
        fetchShares(documentId);
        fetchAccessLogs(documentId);
      }
    },
  };
};