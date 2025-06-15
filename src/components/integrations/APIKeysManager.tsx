
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Key, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Calendar,
  Shield,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  rate_limit: number;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function APIKeysManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    permissions: [] as string[],
    rate_limit: 1000,
    expires_at: ''
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const availablePermissions = [
    { id: 'courses:read', label: 'Ler Cursos', description: 'Visualizar informações de cursos' },
    { id: 'courses:write', label: 'Escrever Cursos', description: 'Criar, editar e excluir cursos' },
    { id: 'students:read', label: 'Ler Estudantes', description: 'Visualizar informações de estudantes' },
    { id: 'students:write', label: 'Escrever Estudantes', description: 'Gerenciar estudantes' },
    { id: 'analytics:read', label: 'Ler Analytics', description: 'Acessar relatórios e métricas' },
    { id: 'webhooks:manage', label: 'Gerenciar Webhooks', description: 'Configurar webhooks' }
  ];

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as chaves API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    try {
      // Generate new API key
      const { data: keyData, error: keyError } = await supabase
        .rpc('generate_api_key');

      if (keyError) throw keyError;

      const fullKey = keyData;
      const keyPrefix = fullKey.substring(0, 8) + '...';
      
      // Hash the key for storage
      const { data: hashData, error: hashError } = await supabase
        .rpc('hash_api_key', { key: fullKey });

      if (hashError) throw hashError;

      // Store in database
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyData.name,
          key_hash: hashData,
          key_prefix: keyPrefix,
          permissions: newKeyData.permissions,
          rate_limit: newKeyData.rate_limit,
          expires_at: newKeyData.expires_at || null
        });

      if (insertError) throw insertError;

      setGeneratedKey(fullKey);
      setNewKeyData({ name: '', permissions: [], rate_limit: 1000, expires_at: '' });
      loadAPIKeys();

      toast({
        title: "Sucesso",
        description: "Chave API criada com sucesso!"
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a chave API",
        variant: "destructive"
      });
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadAPIKeys();
      toast({
        title: "Sucesso",
        description: "Chave API removida com sucesso"
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a chave API",
        variant: "destructive"
      });
    }
  };

  const toggleAPIKey = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      loadAPIKeys();
      toast({
        title: "Sucesso",
        description: `Chave API ${!isActive ? 'ativada' : 'desativada'} com sucesso`
      });
    } catch (error) {
      console.error('Error toggling API key:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da chave API",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave API copiada para a área de transferência"
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciamento de API Keys</h3>
          <p className="text-gray-600">Controle o acesso às suas APIs com chaves seguras</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Chave API
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Nova Chave API</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome da Chave</label>
                <Input
                  placeholder="ex: Integração Mobile"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Permissões</label>
                <div className="space-y-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={newKeyData.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewKeyData({
                              ...newKeyData,
                              permissions: [...newKeyData.permissions, permission.id]
                            });
                          } else {
                            setNewKeyData({
                              ...newKeyData,
                              permissions: newKeyData.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Rate Limit (req/min)</label>
                <Input
                  type="number"
                  value={newKeyData.rate_limit}
                  onChange={(e) => setNewKeyData({ ...newKeyData, rate_limit: parseInt(e.target.value) })}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Data de Expiração (opcional)</label>
                <Input
                  type="datetime-local"
                  value={newKeyData.expires_at}
                  onChange={(e) => setNewKeyData({ ...newKeyData, expires_at: e.target.value })}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createAPIKey} disabled={!newKeyData.name || newKeyData.permissions.length === 0}>
                  Criar Chave
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Generated Key Dialog */}
      <Dialog open={!!generatedKey} onOpenChange={() => setGeneratedKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Chave API Criada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Importante!</span>
              </div>
              <p className="text-sm text-yellow-700">
                Esta é a única vez que você verá esta chave. Copie e armazene-a em local seguro.
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Sua Nova Chave API:</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={generatedKey || ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedKey || '')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button onClick={() => setGeneratedKey(null)} className="w-full">
              Entendi, fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <Card className="p-8 text-center">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma chave API</h3>
            <p className="text-gray-600 mb-4">Crie sua primeira chave API para começar a integrar.</p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeira Chave
            </Button>
          </Card>
        ) : (
          apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold">{apiKey.name}</h4>
                    <Badge className={apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {apiKey.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                    {apiKey.expires_at && new Date(apiKey.expires_at) < new Date() && (
                      <Badge className="bg-red-100 text-red-800">Expirada</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Chave</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {apiKey.key_prefix}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key_prefix)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Permissões</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission.split(':')[1]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Último Uso</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Activity className="w-3 h-3" />
                        {formatDate(apiKey.last_used_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-600">Rate Limit</p>
                      <p className="text-sm font-medium">{apiKey.rate_limit} req/min</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Expira em</p>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        {apiKey.expires_at ? formatDate(apiKey.expires_at) : 'Nunca'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAPIKey(apiKey.id, apiKey.is_active)}
                  >
                    {apiKey.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Chave API</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover a chave "{apiKey.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteAPIKey(apiKey.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
