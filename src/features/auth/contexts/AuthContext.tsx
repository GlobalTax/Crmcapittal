/**
 * Auth Context
 * 
 * React context for authentication state management
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, OAuthProvider } from '../types';
import { AuthService } from '../services/AuthService';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useRateLimit } from '@/utils/rateLimit';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside AuthProvider. Component tree:', {
      location: window.location.pathname,
      stack: new Error().stack
    });
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { validateEmail } = useSecureInput();
  const { checkRateLimit } = useRateLimit();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth listeners');
    
    // Get initial session first
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await AuthService.getSession();
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        } else {
          console.log('AuthProvider: Initial session', session?.user?.email || 'no session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('AuthProvider: Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthProvider: Auth state changed', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only set loading to false after we've handled the auth state change
        if (loading) {
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for', email);
    
    // Input validation
    if (!validateEmail(email)) {
      return { error: { message: 'Email format is invalid' } };
    }
    
    // Rate limiting
    if (!checkRateLimit('login', email)) {
      return { error: { message: 'Too many login attempts. Please try again later.' } };
    }
    
    const { error } = await AuthService.signInWithPassword(email, password);
    if (error) {
      console.error('AuthProvider: Sign in error', error);
    } else {
      console.log('AuthProvider: Sign in successful');
    }
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign up for', email);
    
    // Input validation
    if (!validateEmail(email)) {
      return { error: { message: 'Email format is invalid' } };
    }
    
    if (password.length < 8) {
      return { error: { message: 'Password should be at least 8 characters long' } };
    }
    
    // Rate limiting
    if (!checkRateLimit('signup', email)) {
      return { error: { message: 'Too many signup attempts. Please try again later.' } };
    }
    
    const { error } = await AuthService.signUpWithPassword(email, password);
    if (error) {
      console.error('AuthProvider: Sign up error', error);
    } else {
      console.log('AuthProvider: Sign up successful');
    }
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    await AuthService.signOut();
    setSession(null);
    setUser(null);
    console.log('AuthProvider: Sign out complete');
  };

  const signInWithProvider = async (provider: OAuthProvider) => {
    console.log(`AuthProvider: Attempting OAuth sign in with ${provider}`);
    
    const { error } = await AuthService.signInWithOAuth(provider);
    
    if (error) {
      console.error(`AuthProvider: ${provider} OAuth error`, error);
    } else {
      console.log(`AuthProvider: ${provider} OAuth initiated successfully`);
    }
    return { error };
  };

  const refreshSession = async () => {
    console.log('AuthProvider: Refreshing session manually');
    try {
      const { data: { session }, error } = await AuthService.refreshSession();
      if (error) {
        console.error('AuthProvider: Error refreshing session:', error);
      } else {
        console.log('AuthProvider: Session refreshed successfully', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
      }
      return { error };
    } catch (error) {
      console.error('AuthProvider: Exception refreshing session:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};