
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/course';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('Configurando auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'no user');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with delay to avoid deadlock
          setTimeout(async () => {
            try {
              console.log('Buscando perfil do usuário...');
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.warn('Perfil não encontrado, usuário pode ser novo:', error.message);
                setProfile(null);
              } else {
                console.log('Perfil carregado:', profileData);
                setProfile(profileData);
              }
            } catch (error) {
              console.error('Erro ao buscar perfil:', error);
              setProfile(null);
            }
          }, 100);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erro ao recuperar sessão:', error);
      }
      console.log('Sessão inicial:', session?.user?.email || 'nenhuma sessão');
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
      console.log('Iniciando processo de login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro na autenticação:', error);
        throw error;
      }

      console.log('Login bem-sucedido:', data.user?.email);
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro capturado no signIn:', error);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      console.log('Iniciando processo de cadastro...');
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
        console.error('Erro no cadastro:', error);
        throw error;
      }

      console.log('Cadastro bem-sucedido:', data.user?.email);
      return { success: true, data };
    } catch (error: any) {
      console.error('Erro capturado no signUp:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout...');
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error) {
      console.error('Erro no logout:', error);
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
