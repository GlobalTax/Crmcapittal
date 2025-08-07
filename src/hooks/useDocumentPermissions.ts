import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentPermission, PermissionAssignment } from '@/types/DocumentPermissions';
import { useAuth } from '@/contexts/AuthContext';

export const useDocumentPermissions = (documentId?: string) => {
  const [permissions, setPermissions] = useState<DocumentPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPermissions = async (docId: string) => {
    if (!docId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_permissions')
        .select('*')
        .eq('document_id', docId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPermissions((data || []) as DocumentPermission[]);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los permisos del documento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const grantPermission = async (documentId: string, assignment: PermissionAssignment) => {
    try {
      const { data, error } = await supabase
        .from('document_permissions')
        .insert({
          document_id: documentId,
          user_id: assignment.userId,
          team_id: assignment.teamId,
          permission_type: assignment.permissionType,
          granted_by: user?.id,
          expires_at: assignment.expiresAt?.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setPermissions(prev => [...prev, data as DocumentPermission]);
      toast({
        title: "Éxito",
        description: "Permiso otorgado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error granting permission:', error);
      toast({
        title: "Error",
        description: "No se pudo otorgar el permiso",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePermission = async (permissionId: string, updates: Partial<DocumentPermission>) => {
    try {
      const { data, error } = await supabase
        .from('document_permissions')
        .update(updates)
        .eq('id', permissionId)
        .select()
        .single();

      if (error) throw error;

      setPermissions(prev => 
        prev.map(perm => perm.id === permissionId ? { ...perm, ...data as DocumentPermission } : perm)
      );

      toast({
        title: "Éxito",
        description: "Permiso actualizado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el permiso",
        variant: "destructive",
      });
      return null;
    }
  };

  const revokePermission = async (permissionId: string) => {
    try {
      const { error } = await supabase
        .from('document_permissions')
        .delete()
        .eq('id', permissionId);

      if (error) throw error;

      setPermissions(prev => prev.filter(perm => perm.id !== permissionId));
      toast({
        title: "Éxito",
        description: "Permiso revocado correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: "No se pudo revocar el permiso",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkUserPermission = async (documentId: string, requiredPermission: string) => {
    try {
      const { data, error } = await supabase.rpc('check_document_permission', {
        p_document_id: documentId,
        p_user_id: user?.id,
        p_required_permission: requiredPermission,
      });

      if (error) throw error;
      return data as boolean;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchPermissions(documentId);
    }
  }, [documentId]);

  return {
    permissions,
    loading,
    grantPermission,
    updatePermission,
    revokePermission,
    checkUserPermission,
    refetch: () => documentId && fetchPermissions(documentId),
  };
};