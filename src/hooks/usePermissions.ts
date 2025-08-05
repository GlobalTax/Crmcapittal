import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Permission {
  permission_name: string;
  module: string;
  action: string;
}

export interface PermissionItem {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  permissions: PermissionItem;
}

// Hook para verificar permisos específicos
export const useHasPermission = (permissionName: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['permission', user?.id, permissionName],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase.rpc('has_permission', {
        _user_id: user.id,
        _permission_name: permissionName
      });
      
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener todos los permisos del usuario actual
export const useUserPermissions = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-permissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_user_permissions', {
        _user_id: user.id
      });
      
      if (error) throw error;
      return data as Permission[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener todos los permisos disponibles (solo admins)
export const useAllPermissions = () => {
  return useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('action', { ascending: true });
      
      if (error) throw error;
      return data as PermissionItem[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener permisos por rol
export const useRolePermissions = (role?: string) => {
  return useQuery({
    queryKey: ['role-permissions', role],
    queryFn: async () => {
      if (!role) return [];
      
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          id,
          role,
          permission_id,
          permissions:permissions(*)
        `)
        .eq('role', role as any);
      
      if (error) throw error;
      return data as RolePermission[];
    },
    enabled: !!role,
    staleTime: 10 * 60 * 1000,
  });
};

// Función helper para verificar múltiples permisos
export const useHasAnyPermission = (permissionNames: string[]) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['permissions-any', user?.id, permissionNames],
    queryFn: async () => {
      if (!user?.id || permissionNames.length === 0) return false;
      
      // Verificar cada permiso y retornar true si tiene al menos uno
      const checks = await Promise.all(
        permissionNames.map(async (permissionName) => {
          const { data } = await supabase.rpc('has_permission', {
            _user_id: user.id,
            _permission_name: permissionName
          });
          return data as boolean;
        })
      );
      
      return checks.some(Boolean);
    },
    enabled: !!user?.id && permissionNames.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Función helper para verificar todos los permisos
export const useHasAllPermissions = (permissionNames: string[]) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['permissions-all', user?.id, permissionNames],
    queryFn: async () => {
      if (!user?.id || permissionNames.length === 0) return false;
      
      // Verificar cada permiso y retornar true solo si tiene todos
      const checks = await Promise.all(
        permissionNames.map(async (permissionName) => {
          const { data } = await supabase.rpc('has_permission', {
            _user_id: user.id,
            _permission_name: permissionName
          });
          return data as boolean;
        })
      );
      
      return checks.every(Boolean);
    },
    enabled: !!user?.id && permissionNames.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Constantes de permisos para fácil referencia
export const PERMISSIONS = {
  // Empresas
  COMPANIES_CREATE: 'companies.create',
  COMPANIES_READ: 'companies.read',
  COMPANIES_UPDATE: 'companies.update',
  COMPANIES_DELETE: 'companies.delete',
  COMPANIES_MANAGE_ALL: 'companies.manage_all',
  
  // Contactos
  CONTACTS_CREATE: 'contacts.create',
  CONTACTS_READ: 'contacts.read',
  CONTACTS_UPDATE: 'contacts.update',
  CONTACTS_DELETE: 'contacts.delete',
  CONTACTS_MANAGE_ALL: 'contacts.manage_all',
  
  // Leads
  LEADS_CREATE: 'leads.create',
  LEADS_READ: 'leads.read',
  LEADS_UPDATE: 'leads.update',
  LEADS_DELETE: 'leads.delete',
  LEADS_MANAGE_ALL: 'leads.manage_all',
  LEADS_ASSIGN: 'leads.assign',
  
  // Operaciones
  OPERATIONS_CREATE: 'operations.create',
  OPERATIONS_READ: 'operations.read',
  OPERATIONS_UPDATE: 'operations.update',
  OPERATIONS_DELETE: 'operations.delete',
  OPERATIONS_MANAGE_ALL: 'operations.manage_all',
  
  // Comisiones
  COMMISSIONS_CREATE: 'commissions.create',
  COMMISSIONS_READ: 'commissions.read',
  COMMISSIONS_UPDATE: 'commissions.update',
  COMMISSIONS_DELETE: 'commissions.delete',
  COMMISSIONS_APPROVE: 'commissions.approve',
  COMMISSIONS_PAY: 'commissions.pay',
  
  // Usuarios
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage_roles',
  
  // Sistema
  SYSTEM_ANALYTICS: 'system.analytics',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_AUDIT: 'system.audit',
} as const;