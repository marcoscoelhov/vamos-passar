
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCourse } from '@/contexts/CourseContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useCourse();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = login(email, password);
    
    if (success) {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo à plataforma de cursos.',
      });
      navigate('/');
    } else {
      toast({
        title: 'Erro no login',
        description: 'Credenciais inválidas. Use admin/admin para acessar.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EduPlatform</h1>
          <p className="text-gray-600 mt-2">Faça login para acessar os cursos</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email/Usuário</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email ou usuário"
              required
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
            />
          </div>

          <Button type="submit" className="w-full">
            Entrar
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Usuário demo: <strong>admin</strong> | Senha: <strong>admin</strong>
            </p>
          </div>
        </form>
      </Card>
    </div>
  );
}
