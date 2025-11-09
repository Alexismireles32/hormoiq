import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAnonymous: false,
  signOut: async () => {},
  signInAnonymously: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAnonymous(session?.user?.is_anonymous ?? false);
        setLoading(false);
      } else {
        // Auto sign-in anonymously if no session
        const { data, error } = await supabase.auth.signInAnonymously();
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAnonymous(true);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAnonymous(session?.user?.is_anonymous ?? false);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Immediately sign back in anonymously
    const { data } = await supabase.auth.signInAnonymously();
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setIsAnonymous(true);
    }
  };

  const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isAnonymous, signOut, signInAnonymously }}>
      {children}
    </AuthContext.Provider>
  );
};

