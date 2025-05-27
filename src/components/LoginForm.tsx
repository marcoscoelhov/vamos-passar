
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { signIn, signUp, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha email e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Tentando login com:', { email });
      const result = await signIn(email.trim(), password);
      
      if (result.success) {
        console.log('Login bem-sucedido');
        toast({
          title: 'Login realizado!',
          description: 'Bem-vindo ao VamosPassar.',
        });
        navigate('/');
      } else {
        console.error('Erro no login:', result.error);
        toast({
          title: 'Erro no login',
          description: 'Email ou senha incorretos. Verifique suas credenciais.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erro durante login:', error);
      toast({
        title: 'Erro no login',
        description: 'Erro ao conectar com o servidor. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim() || !name.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Tentando cadastro com:', { email, name });
      const result = await signUp(email.trim(), password, name.trim());
      
      if (result.success) {
        console.log('Cadastro bem-sucedido');
        toast({
          title: 'Conta criada!',
          description: 'Sua conta foi criada com sucesso. Você já pode fazer login.',
        });
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setActiveTab('login');
      } else {
        console.error('Erro no cadastro:', result.error);
        toast({
          title: 'Erro no cadastro',
          description: result.error?.message || 'Erro ao criar conta. Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erro durante cadastro:', error);
      toast({
        title: 'Erro no cadastro',
        description: 'Erro ao conectar com o servidor. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        title: 'Email obrigatório',
        description: 'Por favor, digite seu email para recuperar a senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Tentando recuperação de senha para:', resetEmail);
      const result = await resetPassword(resetEmail.trim());
      
      if (result.success) {
        console.log('Email de recuperação enviado');
        toast({
          title: 'Email enviado!',
          description: 'Verifique sua caixa de entrada para instruções de recuperação de senha.',
        });
        setResetEmail('');
        setActiveTab('login');
      } else {
        console.error('Erro na recuperação:', result.error);
        toast({
          title: 'Erro na recuperação',
          description: result.error?.message || 'Erro ao enviar email de recuperação. Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Erro durante recuperação:', error);
      toast({
        title: 'Erro na recuperação',
        description: 'Erro ao conectar com o servidor. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">VamosPassar</h1>
          <p className="text-gray-600 mt-2">Sua plataforma de estudos para concursos</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            <TabsTrigger value="reset">Recuperar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('reset')}
                  className="text-sm text-blue-600 hover:text-blue-500 underline"
                  disabled={isLoading}
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <Label htmlFor="signup-name">Nome</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  required
                  disabled={isLoading}
                  autoComplete="name"
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Senha</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha segura (mín. 6 caracteres)"
                  required
                  disabled={isLoading}
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Criando conta...
                  </div>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset">
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Recuperar senha</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Digite seu email para receber as instruções de recuperação
                </p>
              </div>

              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Digite seu email"
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar email de recuperação'
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-sm text-gray-600 hover:text-gray-500 flex items-center justify-center gap-1 mx-auto"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao login
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Para testes, crie uma nova conta com qualquer email e senha válidos
          </p>
        </div>
      </Card>
    </div>
  );
}
