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
  department?: string;
  position?: string;
  phone?: string;
  isManager?: boolean;
  managerName?: string;
  managerPosition?: string;
  managerEmail?: string;
  managerPhone?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  department?: string;
  position?: string;
  phone?: string;
  isManager?: boolean;
  managerName?: string;
  managerPosition?: string;
  managerEmail?: string;
  managerPhone?: string;
}

export class UserService extends BaseService {
  static async getUsers(): Promise<ServiceResponse<User[]>> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_users_with_roles');
      
      if (error) throw error;
      
      // Transform data to match User interface
      const transformedData = (data || []).map((user: any) => ({
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        full_name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        status: 'active',
        is_manager: user.is_manager,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: user.phone,
        department: user.company,
        position: user.manager_position
      }));
      
      return super.createResponse(transformedData);
    } catch (error) {
      return super.createResponse(null, super.handleError(error));
    }
  }

  static async createUser(userData: CreateUserData): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await super.supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role
        }
      });

      if (error) throw error;

      return super.createResponse(data.user as any);
    } catch (error) {
      return super.createResponse(null, super.handleError(error));
    }
  }

  static async updateUser(userId: string, updates: UpdateUserData): Promise<ServiceResponse<User>> {
    try {
      const { data, error } = await super.supabase.auth.admin.updateUserById(userId, {
        user_metadata: updates
      });

      if (error) throw error;

      return super.createResponse(data.user as any);
    } catch (error) {
      return super.createResponse(null, super.handleError(error));
    }
  }

  static async deleteUser(userId: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await super.supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      return super.createResponse(undefined);
    } catch (error) {
      return super.createResponse(null, super.handleError(error));
    }
  }

  static async removeUserRole(userId: string, role: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await super.supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as any);

      if (error) throw error;

      return super.createResponse(undefined);
    } catch (error) {
      return super.createResponse(null, super.handleError(error));
    }
  }
}