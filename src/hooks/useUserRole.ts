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

  const fetchUserRole = useCallback(async (userId: string) => {
    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRole(cached.role);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('get_user_highest_role', { _user_id: userId });

      if (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } else {
        const userRole = data as UserRole;
        setRole(userRole);
        
        // Cache the result
        roleCache.set(userId, { role: userRole, timestamp: Date.now() });
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setRole(null);
      setLoading(false);
      return;
    }

    fetchUserRole(user.id);
  }, [user?.id, fetchUserRole]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({ role, loading }), [role, loading]);
};