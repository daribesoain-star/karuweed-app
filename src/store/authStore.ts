import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

interface AuthStoreState {
  user: User | null;
  session: string | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, countryCode: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        set({ session: data.session.access_token });

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        set({
          user: profile as User,
          isLoading: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string, fullName: string, countryCode: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            country_code: countryCode,
            subscription_tier: 'free',
          })
          .select()
          .single();

        if (profileError) throw profileError;

        set({
          user: profile as User,
          session: data.session?.access_token || null,
          isLoading: false,
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({
        user: null,
        session: null,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        set({
          user: null,
          session: null,
          isLoading: false,
        });
        return;
      }

      set({ session: sessionData.session.access_token });

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) throw error;

      set({
        user: profile as User,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      set({
        error: message,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
