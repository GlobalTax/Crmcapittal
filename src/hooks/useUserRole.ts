import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'superadmin' | 'admin' | 'user' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      console.log('🔍 [DEBUG] useUserRole - Starting fetchUserRole');
      console.log('🔍 [DEBUG] useUserRole - User object:', user);
      console.log('🔍 [DEBUG] useUserRole - User ID:', user?.id);
      
      if (!user) {
        console.log('🔍 [DEBUG] useUserRole - No user found, setting role to null');
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 [DEBUG] useUserRole - Calling RPC get_user_highest_role with user ID:', user.id);
        const { data, error } = await supabase
          .rpc('get_user_highest_role', { _user_id: user.id });

        console.log('🔍 [DEBUG] useUserRole - RPC response data:', data);
        console.log('🔍 [DEBUG] useUserRole - RPC response error:', error);

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
        } else {
          console.log('🔍 [DEBUG] useUserRole - Setting role to:', data);
          setRole(data as UserRole);
        }
      } catch (err) {
        console.error('Error in fetchUserRole:', err);
        setRole(null);
      } finally {
        console.log('🔍 [DEBUG] useUserRole - Finished fetchUserRole, setting loading to false');
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  console.log('🔍 [DEBUG] useUserRole - Returning role:', role, 'loading:', loading);
  return { role, loading };
};