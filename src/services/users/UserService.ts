import { BaseService, ServiceResponse } from '../base/BaseService';

export interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: string;
  status: string;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
  phone?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  location?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: string;
}

export class UserService extends BaseService {
  static async getUsers(): Promise<ServiceResponse<User[]>> {
    try {
      const { data, error } = await this.supabase.rpc('get_users_with_roles');
      
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data || []);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async getUserById(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .eq('id', userId)
        .single();
        
      if (error) {
        return this.createResponse(null, this.handleError(error));
      }
      
      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async createUser(userData: CreateUserData): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      });

      if (error) {
        return this.createResponse(null, this.handleError(error));
      }

      // Assign role after user creation
      if (data.user?.id && userData.role) {
        const { error: roleError } = await this.supabase.rpc('assign_user_role_secure', {
          _target_user_id: data.user.id,
          _role: userData.role as any
        });

        if (roleError) {
          console.warn('Role assignment failed:', roleError);
        }
      }

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async updateUser(userId: string, updates: UpdateUserData): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return this.createResponse(null, this.handleError(error));
      }

      // Update role if provided
      if (updates.role) {
        const { error: roleError } = await this.supabase.rpc('update_user_role_secure', {
          _target_user_id: userId,
          _new_role: updates.role as any
        });

        if (roleError) {
          return this.createResponse(null, this.handleError(roleError));
        }
      }

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async deleteUser(userId: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase.rpc('delete_user_completely', {
        _user_id: userId
      });

      if (error) {
        return this.createResponse(null, this.handleError(error));
      }

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }

  static async removeUserRole(userId: string, role: string): Promise<ServiceResponse<any>> {
    try {
      const { data, error } = await this.supabase.rpc('remove_user_role', {
        _user_id: userId,
        _role: role as any
      });

      if (error) {
        return this.createResponse(null, this.handleError(error));
      }

      return this.createResponse(data);
    } catch (error) {
      return this.createResponse(null, this.handleError(error));
    }
  }
}