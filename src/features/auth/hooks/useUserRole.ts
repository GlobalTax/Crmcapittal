/**
 * User Role Hook
 * 
 * Hook for managing user roles and permissions
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { UserRole } from '../types';
import { AuthService } from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';

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
      const userRole = await AuthService.getUserRole(userId);
      setRole(userRole);
      
      // Cache the result
      roleCache.set(userId, { role: userRole, timestamp: Date.now() });
    } catch (err) {
      console.error('Error in fetchUserRole:', err);
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

export const useHasRole = (requiredRole: UserRole) => {
  const { role, loading } = useUserRole();
  
  const hasRole = useMemo(() => {
    if (loading || !role) return false;
    
    // Role hierarchy: superadmin > admin > user
    const roleHierarchy: Record<string, number> = {
      'user': 1,
      'admin': 2,
      'superadmin': 3
    };
    
    const userLevel = roleHierarchy[role] || 0;
    const requiredLevel = roleHierarchy[requiredRole || 'user'] || 0;
    
    return userLevel >= requiredLevel;
  }, [role, requiredRole, loading]);
  
  return { hasRole, loading };
};