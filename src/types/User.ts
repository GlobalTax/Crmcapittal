import { BaseEntity } from './Base';

export type UserRole = 'superadmin' | 'admin' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface User extends BaseEntity {
  user_id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  location?: string;
  is_manager: boolean;
  manager_name?: string;
  manager_position?: string;
  manager_email?: string;
  manager_phone?: string;
  last_login_at?: string;
  login_count?: number;
}

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
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
  role?: UserRole;
  status?: UserStatus;
  department?: string;
  position?: string;
  phone?: string;
  isManager?: boolean;
  managerName?: string;
  managerPosition?: string;
  managerEmail?: string;
  managerPhone?: string;
}