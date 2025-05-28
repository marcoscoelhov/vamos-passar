
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, Lock, User, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface FirstLoginFlowProps {
  user: any;
  onComplete: () => void;
}

export function FirstLoginFlow({ user, onComplete }: FirstLoginFlowProps) {
  const [step, setStep] = useState<'password' | 'profile'>('password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsProfileUpdate, setNeedsProfileUpdate] = useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    // Check if user has a name set
    const checkProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (!profile?.name) {
          setNeedsProfileUpdate(true);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    checkProfile();
  }, [user.id]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Senhas não coincidem',
        description: 'Por favor, confirme sua nova senha corretamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi alterada com sucesso.',
      });

      // Check if we need to update profile
      if (needsProfileUpdate) {
        setStep('profile');
      } else {
        // Complete the flow
        await completeFlow();
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: error.message || 'Não foi possível alterar a senha.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe seu nome completo.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          first_login: false,
          must_change_password: false,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Perfil atualizado',
        description: 'Bem-vindo ao sistema! Seu perfil foi configurado.',
      });

      onComplete();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: error.message || 'Não foi possível atualizar o perfil.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeFlow = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_login: false,
          must_change_password: false,
        })
        .eq('id', user.id);

      if (error) throw error;

      onComplete();
    } catch (error: any) {
      console.error('Error completing flow:', error);
      toast({
        title: 'Erro ao finalizar',
        description: 'Houve um problema ao finalizar o processo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {step === 'password' ? (
              <Lock className="w-8 h-8 text-blue-600" />
            ) : (
              <User className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'password' ? 'Alterar Senha' : 'Completar Perfil'}
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'password' 
              ? 'Por segurança, você deve alterar sua senha padrão.'
              : 'Complete seu perfil para continuar.'
            }
          </p>
        </div>

        {step === 'password' ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="bg-amber-50 p-3 rounded-md flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800">
                  <strong>Sua senha atual é:</strong> 12345
                </p>
                <p className="text-amber-700 mt-1">
                  Por favor, escolha uma nova senha segura.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite 12345"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Alterando senha...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Email:</strong> {user.email}
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Completar Cadastro
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
