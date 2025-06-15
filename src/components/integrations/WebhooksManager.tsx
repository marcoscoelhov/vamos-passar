
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Webhook, 
  Plus, 
  Send, 
  Trash2, 
  TestTube,
  CheckCircle,
  AlertTriangle,
  Clock,
  Globe
} from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret_token: string | null;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  headers: Record<string, string>;
  created_at: string;
}

export function WebhooksManager() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [newWebhookData, setNewWebhookData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret_token: '',
    retry_count: 3,
    timeout_seconds: 30,
    headers: '{}',
    is_active: true
  });
  const { toast } = useToast();

  const availableEvents = [
    { id: 'student.enrolled', label: 'Estudante Matriculado', description: 'Disparado quando um estudante se matricula' },
    { id: 'student.completed', label: 'Curso Concluído', description: 'Disparado quando um estudante conclui um curso' },
    { id: 'course.created', label: 'Curso Criado', description: 'Disparado quando um novo curso é criado' },
    { id: 'course.updated', label: 'Curso Atualizado', description: 'Disparado quando um curso é atualizado' },
    { id: 'payment.confirmed', label: 'Pagamento Confirmado', description: 'Disparado quando um pagamento é confirmado' },
    { id: 'user.created', label: 'Usuário Criado', description: 'Disparado quando um novo usuário é criado' }
  ];

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os webhooks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    try {
      let headers = {};
      try {
        headers = JSON.parse(newWebhookData.headers);
      } catch {
        throw new Error('Headers inválidos. Use formato JSON válido.');
      }

      const { error } = await supabase
        .from('webhook_configs')
        .insert({
          name: newWebhookData.name,
          url: newWebhookData.url,
          events: newWebhookData.events,
          secret_token: newWebhookData.secret_token || null,
          retry_count: newWebhookData.retry_count,
          timeout_seconds: newWebhookData.timeout_seconds,
          headers: headers,
          is_active: newWebhookData.is_active
        });

      if (error) throw error;

      setNewWebhookData({
        name: '',
        url: '',
        events: [],
        secret_token: '',
        retry_count: 3,
        timeout_seconds: 30,
        headers: '{}',
        is_active: true
      });
      setShowCreateDialog(false);
      loadWebhooks();

      toast({
        title: "Sucesso",
        description: "Webhook criado com sucesso!"
      });
    } catch (error: any) {
      console.error('Error creating webhook:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadWebhooks();
      toast({
        title: "Sucesso",
        description: "Webhook removido com sucesso"
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o webhook",
        variant: "destructive"
      });
    }
  };

  const toggleWebhook = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('webhook_configs')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;

      loadWebhooks();
      toast({
        title: "Sucesso",
        description: `Webhook ${!isActive ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do webhook",
        variant: "destructive"
      });
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhook(webhook.id);
    
    try {
      const testPayload = {
        event_type: 'test.webhook',
        timestamp: new Date().toISOString(),
        data: {
          message: 'Este é um teste do webhook',
          webhook_name: webhook.name,
          test_id: Math.random().toString(36).substr(2, 9)
        }
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/webhook-sender`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          event_type: 'test.webhook',
          data: testPayload.data,
          webhook_configs: [webhook]
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Teste enviado!",
          description: "Verifique o endpoint para confirmar o recebimento"
        });
      } else {
        throw new Error(result.error || 'Erro no teste');
      }
    } catch (error: any) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Erro no teste",
        description: error.message || "Não foi possível enviar o teste",
        variant: "destructive"
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const formatDate = (dateString: string) => {
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
          <h3 className="text-lg font-semibold">Gerenciamento de Webhooks</h3>
          <p className="text-gray-600">Configure endpoints para receber eventos em tempo real</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome do Webhook</label>
                  <Input
                    placeholder="ex: Notificações Zapier"
                    value={newWebhookData.name}
                    onChange={(e) => setNewWebhookData({ ...newWebhookData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">URL do Endpoint</label>
                  <Input
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={newWebhookData.url}
                    onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Eventos para Escutar</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {availableEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={event.id}
                        checked={newWebhookData.events.includes(event.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewWebhookData({
                              ...newWebhookData,
                              events: [...newWebhookData.events, event.id]
                            });
                          } else {
                            setNewWebhookData({
                              ...newWebhookData,
                              events: newWebhookData.events.filter(e => e !== event.id)
                            });
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <label
                          htmlFor={event.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {event.label}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Token Secreto (opcional)</label>
                  <Input
                    type="password"
                    placeholder="Para validação de assinatura"
                    value={newWebhookData.secret_token}
                    onChange={(e) => setNewWebhookData({ ...newWebhookData, secret_token: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tentativas</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newWebhookData.retry_count}
                    onChange={(e) => setNewWebhookData({ ...newWebhookData, retry_count: parseInt(e.target.value) })}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Timeout (seg)</label>
                  <Input
                    type="number"
                    min="5"
                    max="120"
                    value={newWebhookData.timeout_seconds}
                    onChange={(e) => setNewWebhookData({ ...newWebhookData, timeout_seconds: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Headers Customizados (JSON)</label>
                <Textarea
                  placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
                  value={newWebhookData.headers}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, headers: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={createWebhook} 
                  disabled={!newWebhookData.name || !newWebhookData.url || newWebhookData.events.length === 0}
                >
                  Criar Webhook
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <Card className="p-8 text-center">
            <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum webhook configurado</h3>
            <p className="text-gray-600 mb-4">Configure webhooks para receber eventos automaticamente.</p>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Primeiro Webhook
            </Button>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Webhook className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold">{webhook.name}</h4>
                    <Badge className={webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {webhook.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">URL do Endpoint</p>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                          {webhook.url}
                        </code>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Eventos Configurados</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tentativas</p>
                        <p className="text-sm font-medium">{webhook.retry_count} tentativas</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Timeout</p>
                        <p className="text-sm font-medium">{webhook.timeout_seconds}s</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Criado em</p>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {formatDate(webhook.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook(webhook)}
                    disabled={testingWebhook === webhook.id || !webhook.is_active}
                    className="gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    {testingWebhook === webhook.id ? 'Testando...' : 'Testar'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWebhook(webhook.id, webhook.is_active)}
                  >
                    {webhook.is_active ? 'Desativar' : 'Ativar'}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Webhook</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover o webhook "{webhook.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteWebhook(webhook.id)}
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
