
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile } from '@/types/course';
import { logger } from '@/utils/logger';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    logger.debug('Configurando auth state listener...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug('Auth state changed', { event, email: session?.user?.email || 'no user' });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile with delay to avoid deadlock
          setTimeout(async () => {
            try {
              logger.debug('Buscando perfil do usuário...');
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                logger.warn('Perfil não encontrado, usuário pode ser novo', { error: error.message });
                setProfile(null);
              } else {
                logger.info('Perfil carregado com sucesso');
                setProfile(profileData);
              }
            } catch (error) {
              logger.error('Erro ao buscar perfil', error);
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
        logger.error('Erro ao recuperar sessão', error);
      }
      logger.debug('Sessão inicial recuperada', { email: session?.user?.email || 'nenhuma sessão' });
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
      logger.info('Iniciando processo de login...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Erro na autenticação', error);
        throw error;
      }

      logger.info('Login bem-sucedido');
      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro capturado no signIn', error);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      logger.info('Iniciando processo de cadastro...');
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
        logger.error('Erro no cadastro', error);
        throw error;
      }

      logger.info('Cadastro bem-sucedido');
      return { success: true, data };
    } catch (error: any) {
      logger.error('Erro capturado no signUp', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      logger.info('Fazendo logout...');
      await supabase.auth.signOut();
      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error) {
      logger.error('Erro no logout', error);
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
