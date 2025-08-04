/**
 * Auth Types
 * 
 * All types related to authentication and authorization
 */

import { User, Session } from '@supabase/supabase-js';

// User role types
export type UserRole = 'superadmin' | 'admin' | 'user' | null;

// Auth context interface
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'microsoft' | 'google') => Promise<{ error: any }>;
  refreshSession: () => Promise<{ error: any }>;
}

// Auth mode for forms
export type AuthMode = 'signin' | 'signup';

// OAuth providers
export type OAuthProvider = 'microsoft' | 'google';

// User profile interface
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

// Auth errors
export interface AuthError {
  message: string;
  status?: number;
}

// Auth state
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

// Rate limiting types
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  keyGenerator?: (action: string, identifier: string) => string;
}

// Security validation types
export interface SecurityValidation {
  isValidEmail: (email: string) => boolean;
  isValidPassword: (password: string) => boolean;
  sanitizeInput: (input: string) => string;
}