import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { supabase } from '@/integrations/supabase/client';
import { AuthStore } from './types';
import { useSecureInput } from '@/hooks/useSecureInput';
import { useRateLimit } from '@/utils/rateLimit';

export const useAuthStore = create<AuthStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // State
        user: null,
        session: null,
        loading: true,
        isAuthenticated: false,

        // Actions
        setUser: (user) => {
          set((state) => {
            state.user = user;
            state.isAuthenticated = !!user;
          });
        },

        setSession: (session) => {
          set((state) => {
            state.session = session;
            state.user = session?.user ?? null;
            state.isAuthenticated = !!session?.user;
          });
        },

        setLoading: (loading) => {
          set((state) => {
            state.loading = loading;
          });
        },

        signIn: async (email, password) => {
          // Input validation and rate limiting
          const { validateEmail } = useSecureInput();
          const { checkRateLimit } = useRateLimit();
          
          if (!validateEmail(email)) {
            return { error: { message: 'Email format is invalid' } };
          }
          
          if (!checkRateLimit('login', email)) {
            return { error: { message: 'Too many login attempts. Please try again later.' } };
          }

          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          return { error };
        },

        signUp: async (email, password) => {
          const { validateEmail } = useSecureInput();
          const { checkRateLimit } = useRateLimit();
          
          if (!validateEmail(email)) {
            return { error: { message: 'Email format is invalid' } };
          }
          
          if (password.length < 8) {
            return { error: { message: 'Password should be at least 8 characters long' } };
          }
          
          if (!checkRateLimit('signup', email)) {
            return { error: { message: 'Too many signup attempts. Please try again later.' } };
          }

          const redirectUrl = `${window.location.origin}/`;
          
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl
            }
          });

          return { error };
        },

        signOut: async () => {
          await supabase.auth.signOut();
          set((state) => {
            state.session = null;
            state.user = null;
            state.isAuthenticated = false;
          });
        },

        signInWithProvider: async (provider) => {
          const redirectUrl = `${window.location.origin}/auth/callback`;
          
          const { error } = await supabase.auth.signInWithOAuth({
            provider: provider as any,
            options: {
              redirectTo: redirectUrl,
              scopes: provider === 'microsoft' 
                ? 'openid profile email Mail.Read Mail.Send Calendars.Read Calendars.ReadWrite offline_access'
                : 'openid profile email https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly'
            }
          });

          return { error };
        },

        refreshSession: async () => {
          try {
            const { data: { session }, error } = await supabase.auth.refreshSession();
            if (!error && session) {
              get().setSession(session);
            }
            return { error };
          } catch (error) {
            return { error };
          }
        },
      }))
    ),
    {
      name: 'auth-store',
    }
  )
);

// Initialize auth listener
let authListenerInitialized = false;

export const initializeAuthListener = () => {
  if (authListenerInitialized) return;
  
  authListenerInitialized = true;
  
  // Get initial session
  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (!error) {
      useAuthStore.getState().setSession(session);
    }
    useAuthStore.getState().setLoading(false);
  });

  // Set up auth state listener
  supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.getState().setSession(session);
    if (useAuthStore.getState().loading) {
      useAuthStore.getState().setLoading(false);
    }
  });
};

// Selectors for optimized subscriptions
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  session: state.session,
  loading: state.loading,
  isAuthenticated: state.isAuthenticated,
  signIn: state.signIn,
  signUp: state.signUp,
  signOut: state.signOut,
  signInWithProvider: state.signInWithProvider,
  refreshSession: state.refreshSession,
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.loading);