
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { WebhookConfig, NewWebhookData } from './types';

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [newWebhookData, setNewWebhookData] = useState<NewWebhookData>({
    name: '',
    url: '',
    events: [],
    secret_token: '',
    retry_count: 3,
    timeout_seconds: 30,
    headers: '{}',
    is_active: true
  });
  const { toast } = useToast();

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData: WebhookConfig[] = (data || []).map(item => ({
        ...item,
        headers: typeof item.headers === 'object' && item.headers !== null ? item.headers as Record<string, string> : {}
      }));
      
      setWebhooks(transformedData);
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

      const { data, error } = await supabase.functions.invoke('webhook-sender', {
        body: {
          event_type: 'test.webhook',
          data: testPayload.data,
          webhook_configs: [webhook]
        }
      });

      if (error) throw error;
      
      toast({
        title: "Teste enviado!",
        description: "Verifique o endpoint para confirmar o recebimento"
      });
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

  useEffect(() => {
    loadWebhooks();
  }, []);

  return {
    webhooks,
    loading,
    showCreateDialog,
    setShowCreateDialog,
    newWebhookData,
    setNewWebhookData,
    testingWebhook,
    createWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    formatDate
  };
}
