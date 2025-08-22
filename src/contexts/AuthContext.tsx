
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useRateLimit } from '@/utils/rateLimit';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // More detailed error for debugging
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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthProvider: Error getting initial session:', error);
        } else {
          console.log('AuthProvider: Initial session', session?.user?.email || 'no session');
          console.log('AuthProvider: Session details:', {
            userId: session?.user?.id,
            email: session?.user?.email,
            accessToken: session?.access_token ? 'present' : 'missing',
            refreshToken: session?.refresh_token ? 'present' : 'missing'
          });
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
        console.log('AuthProvider: Event details:', {
          event,
          userId: session?.user?.id,
          email: session?.user?.email,
          hasAccessToken: !!session?.access_token,
          hasRefreshToken: !!session?.refresh_token
        });
        
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
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('AuthProvider: Sign in error', error);
    } else {
      console.log('AuthProvider: Sign in successful');
    }
    return { error };
  };

  const signOut = async () => {
    console.log('AuthProvider: Signing out');
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    console.log('AuthProvider: Sign out complete');
  };

  const refreshSession = async () => {
    console.log('AuthProvider: Refreshing session manually');
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
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
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
