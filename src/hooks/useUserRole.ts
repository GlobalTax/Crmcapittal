
/**
 * Unified User Role Hook - Improved version
 * 
 * Maneja roles de usuario con gestión de estados mejorada, cache inteligente,
 * logging detallado y manejo robusto de errores.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'superadmin' | 'admin' | 'manager' | 'sales_rep' | 'marketing' | 'support' | 'user' | null;

export type RoleState = {
  role: UserRole;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  refreshRole?: () => void;
}

// Cache inteligente con timestamps y TTL
const roleCache = new Map<string, { 
  role: UserRole; 
  timestamp: number; 
  error?: string;
}>();

const CACHE_DURATION = 3 * 60 * 1000; // 3 minutos
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Logging centralizado para debugging
const logRoleAction = (action: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[useUserRole] ${action}:`, data);
  }
};

// Retry logic para manejar fallos temporales
const retryWithDelay = async (fn: () => Promise<any>, retries: number = MAX_RETRIES): Promise<any> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      logRoleAction('Retrying after error', { error, retriesLeft: retries - 1 });
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryWithDelay(fn, retries - 1);
    }
    throw error;
  }
};

export const useUserRole = (): RoleState => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Acceso seguro al contexto de autenticación
  let user = null;
  let isAuthenticated = false;
  
  try {
    const auth = useAuth();
    user = auth.user;
    isAuthenticated = !!user;
  } catch (authError) {
    logRoleAction('Auth context not available', authError);
    // Para usuarios no autenticados, retornamos estado consistente
    return useMemo(() => ({
      role: null,
      loading: false,
      error: null,
      isAuthenticated: false
    }), []);
  }

  const fetchUserRole = useCallback(async (userId: string) => {
    logRoleAction('Fetching role for user', { userId });
    
    // Verificar cache primero
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logRoleAction('Using cached role', { role: cached.role, age: Date.now() - cached.timestamp });
      setRole(cached.role);
      setError(cached.error || null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchRole = async () => {
        const { data, error } = await supabase
          .rpc('get_user_highest_role', { _user_id: userId });

        if (error) {
          throw new Error(`RPC Error: ${error.message}`);
        }

        return data as UserRole;
      };

      const userRole = await retryWithDelay(fetchRole);
      
      logRoleAction('Role fetched successfully', { userId, role: userRole });
      
      // Cache con resultado exitoso
      roleCache.set(userId, { 
        role: userRole || null, 
        timestamp: Date.now() 
      });
      
      setRole(userRole || null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      logRoleAction('Error fetching role', { userId, error: errorMessage, err });
      
      // No cachear errores para permitir reintentos
      setError(errorMessage);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Invalidar cache cuando el usuario cambia
  const invalidateCache = useCallback((userId: string) => {
    roleCache.delete(userId);
    logRoleAction('Cache invalidated', { userId });
  }, []);

  useEffect(() => {
    if (!user?.id) {
      logRoleAction('No user ID available', { user });
      setRole(null);
      setError(null);
      setLoading(false);
      return;
    }

    fetchUserRole(user.id);
  }, [user?.id, fetchUserRole]);

  // Función para refrescar manualmente el rol
  const refreshRole = useCallback(() => {
    if (user?.id) {
      invalidateCache(user.id);
      fetchUserRole(user.id);
    }
  }, [user?.id, invalidateCache, fetchUserRole]);

  // Memoizar el estado para evitar re-renders innecesarios
  return useMemo(() => ({
    role,
    loading,
    error,
    isAuthenticated,
    refreshRole
  }), [role, loading, error, isAuthenticated, refreshRole]);
};

// Hook para verificar permisos específicos
export const useHasRole = (requiredRole: UserRole) => {
  const { role, loading, error, isAuthenticated } = useUserRole();
  
  const hasRole = useMemo(() => {
    if (loading || error || !isAuthenticated || !role) {
      return false;
    }
    
    if (!requiredRole) {
      return true; // Si no se requiere rol específico
    }
    
    // Jerarquía de roles: superadmin > admin > user
    const roleHierarchy: Record<string, number> = {
      'user': 1,
      'admin': 2,
      'superadmin': 3
    };
    
    const userLevel = roleHierarchy[role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }, [role, requiredRole, loading, error, isAuthenticated]);
  
  return useMemo(() => ({
    hasRole,
    loading,
    error,
    isAuthenticated,
    currentRole: role
  }), [hasRole, loading, error, isAuthenticated, role]);
};
