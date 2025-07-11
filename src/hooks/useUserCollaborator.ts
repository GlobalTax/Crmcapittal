import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface UserCollaborator {
  id: string;
  name: string;
  email: string;
  collaborator_type: string;
  commission_percentage: number;
  is_active: boolean;
}

export const useUserCollaborator = () => {
  const [collaborator, setCollaborator] = useState<UserCollaborator | null>(null);
  const [loading, setLoading] = useState(true);
  const { role } = useUserRole();

  useEffect(() => {
    const fetchUserCollaborator = async () => {
      try {
        setLoading(true);
        
        // Only fetch collaborator for non-admin users
        if (role === 'admin' || role === 'superadmin') {
          setCollaborator(null);
          return;
        }

        const { data: user } = await supabase.auth.getUser();
        if (!user?.user?.id) {
          setCollaborator(null);
          return;
        }

        const { data, error } = await supabase
          .from('collaborators')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user collaborator:', error);
        }

        setCollaborator(data || null);
      } catch (err) {
        console.error('Error in useUserCollaborator:', err);
        setCollaborator(null);
      } finally {
        setLoading(false);
      }
    };

    if (role !== undefined) {
      fetchUserCollaborator();
    }
  }, [role]);

  return { collaborator, loading, isCollaborator: !!collaborator };
};