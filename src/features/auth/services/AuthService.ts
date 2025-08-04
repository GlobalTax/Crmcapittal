/**
 * Auth Service
 * 
 * Service layer for authentication operations and business logic
 */

import { supabase } from '@/integrations/supabase/client';
import { UserRole, OAuthProvider, UserProfile } from '../types';

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  /**
   * Sign up with email and password
   */
  static async signUpWithPassword(email: string, password: string) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { data, error };
  }

  /**
   * Sign in with OAuth provider
   */
  static async signInWithOAuth(provider: OAuthProvider) {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: redirectUrl,
        scopes: provider === 'microsoft' 
          ? 'openid profile email Mail.Read Mail.Send Calendars.Read Calendars.ReadWrite offline_access'
          : 'openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly'
      }
    });
    return { data, error };
  }

  /**
   * Sign out user
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Get current session
   */
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  }

  /**
   * Refresh session
   */
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();
    return { data, error };
  }

  /**
   * Get current user
   */
  static async getUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  }

  /**
   * Get user role
   */
  static async getUserRole(userId: string): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_highest_role', { _user_id: userId });

      if (error) {
        console.error('Error fetching user role:', error);
        return 'user';
      }

      return (data as UserRole) || 'user';
    } catch (err) {
      console.error('Error in getUserRole:', err);
      return 'user';
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Error in getUserProfile:', err);
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      return { data, error };
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { data, error };
  }

  /**
   * Update password
   */
  static async updatePassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  }

  /**
   * Check if user has specific role
   */
  static async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: userId, _role: role });

      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }

      return data as boolean;
    } catch (err) {
      console.error('Error in hasRole:', err);
      return false;
    }
  }
}