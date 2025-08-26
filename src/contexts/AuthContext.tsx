import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isSuperAdmin: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async (sessionUser: User | null) => {
      if (sessionUser) {
        setUser(sessionUser);
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', sessionUser.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else {
          setProfile(profileData);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchSessionAndProfile(session?.user ?? null);
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setLoading(true);
        fetchSessionAndProfile(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const isSuperAdmin = profile?.role === 'superadmin';

  const refreshProfile = async () => {
    if (user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error refreshing profile:", error);
      } else {
        setProfile(profileData);
      }
    }
  };

  const value = { user, profile, isSuperAdmin, loading, refreshProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
