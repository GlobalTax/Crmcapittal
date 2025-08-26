/**
 * User Management Service
 * 
 * Centralized service for all user management operations
 */

import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'superadmin' | 'admin' | 'user';

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  managerName?: string;
  managerPosition?: string;
  managerPhone?: string;
}

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  is_manager: boolean;
  manager_name?: string;
  manager_position?: string;
}

export interface DatabaseFunctionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class UserManagementService {
  /**
   * Fetch all users with their roles
   */
  static async fetchUsersWithRoles(): Promise<User[]> {
    const { data, error } = await supabase.rpc('get_users_with_roles');
    
    if (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
    
    return (data || []).map((item: any) => ({
      user_id: item.user_id,
      email: item.email,
      role: item.role as UserRole,
      first_name: item.first_name,
      last_name: item.last_name,
      is_manager: item.is_manager,
      manager_name: item.manager_name,
      manager_position: item.manager_position,
    }));
  }

  /**
   * Validate password strength using server-side validation
   */
  static async validatePasswordStrength(password: string): Promise<{ valid: boolean; errors?: string[] }> {
    const { data, error } = await supabase.rpc('validate_password_strength', { password });
    
    if (error) {
      throw new Error(`Error validating password: ${error.message}`);
    }
    
    return data as { valid: boolean; errors?: string[] };
  }

  /**
   * Create a new user with role assignment and optional manager profile
   */
  static async createUser(userData: CreateUserData, photo?: File): Promise<any> {
    // Server-side password validation
    const passwordValidation = await this.validatePasswordStrength(userData.password);
    
    if (!passwordValidation.valid) {
      const errors = passwordValidation.errors || ['Invalid password'];
      throw new Error(`Weak password: ${errors.join(', ')}`);
    }

    // Create user via Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || ''
        },
        emailRedirectTo: `${window.location.origin}/`
      }
    });

    if (authError) {
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create user in authentication system');
    }

    // Assign role
    await this.assignRole(authData.user.id, userData.role);

    // Create manager profile if needed
    if (userData.role === 'admin' && userData.managerName) {
      const managerId = await this.createManagerProfile(authData.user.id, userData);
      
      // Upload photo if provided
      if (photo && managerId) {
        await this.uploadManagerPhoto(managerId, photo);
      }
    }

    return authData;
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role
      });

    if (error) {
      throw new Error(`Error assigning role: ${error.message}`);
    }
  }

  /**
   * Create manager profile
   */
  static async createManagerProfile(userId: string, userData: CreateUserData): Promise<string> {
    const { data, error } = await supabase
      .from('operation_managers')
      .insert({
        user_id: userId,
        name: userData.managerName!,
        email: userData.email,
        phone: userData.managerPhone,
        position: userData.managerPosition
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Error creating manager profile: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Upload manager photo
   */
  static async uploadManagerPhoto(managerId: string, photoFile: File): Promise<string> {
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${managerId}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('manager-photos')
      .upload(fileName, photoFile, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('manager-photos')
      .getPublicUrl(fileName);

    // Update manager profile with photo URL
    const { error: updateError } = await supabase
      .from('operation_managers')
      .update({ photo: publicUrl })
      .eq('id', managerId);

    if (updateError) {
      throw new Error(`Error updating manager photo: ${updateError.message}`);
    }

    return publicUrl;
  }

  /**
   * Remove user role
   */
  static async removeUserRole(userId: string, role: UserRole): Promise<DatabaseFunctionResponse> {
    const { data, error } = await supabase.rpc('remove_user_role', {
      _user_id: userId,
      _role: role
    });

    if (error) {
      throw new Error(`Error removing role: ${error.message}`);
    }

    const result = data as unknown as DatabaseFunctionResponse;
    if (!result.success) {
      throw new Error(result.error || 'Error removing role');
    }

    return result;
  }

  /**
   * Delete user completely
   */
  static async deleteUser(userId: string): Promise<DatabaseFunctionResponse> {
    const { data, error } = await supabase.rpc('delete_user_completely', {
      _user_id: userId
    });

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }

    const result = data as unknown as DatabaseFunctionResponse;
    if (!result.success) {
      throw new Error(result.error || 'Error deleting user');
    }

    return result;
  }
}