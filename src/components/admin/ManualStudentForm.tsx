
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface ManualStudentFormProps {
  onStudentAdded?: () => void;
}

export function ManualStudentForm({ onStudentAdded }: ManualStudentFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, preencha um email válido.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Chamando função create-user...', { email, name: name.trim() || null, role });
      
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: email.trim(),
          name: name.trim() || null,
          role,
        },
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro ao invocar função:', error);
        throw new Error(error.message || 'Erro ao chamar função de criação de usuário');
      }

      if (!data?.success) {
        console.error('Função retornou erro:', data);
        throw new Error(data?.error || 'Erro desconhecido na criação do usuário');
      }

      toast({
        title: 'Usuário criado com sucesso',
        description: data.message || `${role === 'professor' ? 'Professor' : 'Aluno'} ${name || email} foi adicionado ao sistema.`,
      });

      // Reset form
      setEmail('');
      setName('');
      setRole('student');
      onStudentAdded?.();
    } catch (error: any) {
      console.error('Erro na criação do usuário:', error);
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Não foi possível criar o usuário. Verifique os logs para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Adicionar Usuário Manualmente</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo (opcional)
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do usuário"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Tipo de Usuário
          </Label>
          <Select value={role} onValueChange={(value: 'student' | 'professor') => setRole(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Aluno</SelectItem>
              <SelectItem value="professor">Professor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Senha padrão:</strong> 12345<br />
            {!name.trim() ? (
              <>O usuário será solicitado a informar o nome e alterar a senha no primeiro acesso.</>
            ) : (
              <>O usuário será solicitado a alterar a senha no primeiro acesso.</>
            )}
          </p>
        </div>

        <Button type="submit" disabled={isLoading || !email.trim()} className="w-full">
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Criando usuário...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Usuário
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
