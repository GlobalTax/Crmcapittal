
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'superadmin' | 'admin' | 'user' | null;

// Cache for user roles to prevent excessive API calls
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  console.log('useUserRole: Hook called');
  console.log('useUserRole: User from auth context:', user?.email || 'no user');

  const fetchUserRole = useCallback(async (userId: string) => {
    console.log('useUserRole: Fetching role for user ID:', userId);
    
    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('useUserRole: Using cached role:', cached.role);
      setRole(cached.role);
      setLoading(false);
      return;
    }

    try {
      console.log('useUserRole: Making RPC call to get_user_highest_role');
      const { data, error } = await supabase
        .rpc('get_user_highest_role', { _user_id: userId });

      if (error) {
        console.error('useUserRole: Error fetching user role:', error);
        setRole(null);
      } else {
        const userRole = data as UserRole;
        console.log('useUserRole: Received role from RPC:', userRole);
        setRole(userRole);
        
        // Cache the result
        roleCache.set(userId, { role: userRole, timestamp: Date.now() });
      }
    } catch (err) {
      console.error('useUserRole: Error in fetchUserRole:', err);
      setRole(null);
    } finally {
      console.log('useUserRole: Setting loading to false');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log('useUserRole: useEffect triggered, user?.id:', user?.id);
    
    if (!user?.id) {
      console.log('useUserRole: No user ID, setting role to null');
      setRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole(user.id);
  }, [user?.id, fetchUserRole]);

  console.log('useUserRole: Returning role:', role, 'loading:', loading);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({ role, loading }), [role, loading]);
};
