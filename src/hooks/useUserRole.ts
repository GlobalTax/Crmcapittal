
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/stores/useAuthStore';

export type UserRole = 'superadmin' | 'admin' | 'user' | null;

// Cache for user roles to prevent excessive API calls
const roleCache = new Map<string, { role: UserRole; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  
  // Safe auth access with inline error handling
  let user = null;
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    console.log('useUserRole: Auth context not available, using default role');
    // Return default values when auth context is not available
    return useMemo(() => ({ role: 'user' as UserRole, loading: false }), []);
  }

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
        // Set default role instead of null to prevent render issues
        setRole('user');
      } else {
        const userRole = data as UserRole;
        setRole(userRole || 'user'); // Default to 'user' if null
        
        // Cache the result
        roleCache.set(userId, { role: userRole || 'user', timestamp: Date.now() });
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
      // Set default role to prevent render issues
      setRole('user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setRole('user'); // Default role for unauthenticated users
      setLoading(false);
      return;
    }

    fetchUserRole(user.id);
  }, [user?.id, fetchUserRole]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({ role: role || 'user', loading }), [role, loading]);
};
