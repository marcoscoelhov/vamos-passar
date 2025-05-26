
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  is_admin: boolean;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                setProfile(profileData);
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao VamosPassar.',
      });

      return { success: true, data };
    } catch (error: any) {
      let message = 'Erro inesperado. Tente novamente.';
      
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email ou senha incorretos.';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Por favor, confirme seu email antes de fazer login.';
      }

      toast({
        title: 'Erro no login',
        description: message,
        variant: 'destructive',
      });

      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para ativar a conta.',
      });

      return { success: true, data };
    } catch (error: any) {
      let message = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message.includes('already been registered')) {
        message = 'Este email já está em uso.';
      }

      toast({
        title: 'Erro no cadastro',
        description: message,
        variant: 'destructive',
      });

      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
  };
}
