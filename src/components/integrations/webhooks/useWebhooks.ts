
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WebhookConfig, NewWebhookData } from './types';

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const { toast } = useToast();

  const [newWebhookData, setNewWebhookData] = useState<NewWebhookData>({
    name: '',
    url: '',
    events: [],
    secret_token: '',
    retry_count: 3,
    timeout_seconds: 30,
    headers: '{}',
    is_active: true,
  });

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
        title: 'Erro',
        description: 'Não foi possível carregar os webhooks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createWebhook = async () => {
    try {
      let headers = {};
      if (newWebhookData.headers.trim()) {
        headers = JSON.parse(newWebhookData.headers);
      }

      const { error } = await supabase
        .from('webhook_configs')
        .insert([
          {
            name: newWebhookData.name,
            url: newWebhookData.url,
            events: newWebhookData.events,
            secret_token: newWebhookData.secret_token || null,
            retry_count: newWebhookData.retry_count,
            timeout_seconds: newWebhookData.timeout_seconds,
            headers,
            is_active: newWebhookData.is_active,
          },
        ]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook criado com sucesso!',
      });

      setNewWebhookData({
        name: '',
        url: '',
        events: [],
        secret_token: '',
        retry_count: 3,
        timeout_seconds: 30,
        headers: '{}',
        is_active: true,
      });

      setShowCreateDialog(false);
      loadWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o webhook.',
        variant: 'destructive',
      });
    }
  };

  const createKwifyWebhook = async () => {
    try {
      const kwifyWebhook = {
        name: 'kwify',
        url: 'https://hxrwlshmfgcnyfugbetw.supabase.co/functions/v1/webhook-receiver',
        events: ['sale.completed', 'payment.approved', 'sale.refunded', 'payment.refunded'],
        secret_token: '',
        retry_count: 3,
        timeout_seconds: 30,
        headers: {},
        is_active: true,
      };

      const { error } = await supabase
        .from('webhook_configs')
        .insert([kwifyWebhook]);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Webhook do Kwify criado com sucesso!',
      });

      loadWebhooks();
    } catch (error) {
      console.error('Error creating Kwify webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o webhook do Kwify.',
        variant: 'destructive',
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

      toast({
        title: 'Sucesso',
        description: 'Webhook excluído com sucesso!',
      });

      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o webhook.',
        variant: 'destructive',
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

      toast({
        title: 'Sucesso',
        description: `Webhook ${!isActive ? 'ativado' : 'desativado'} com sucesso!`,
      });

      loadWebhooks();
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o webhook.',
        variant: 'destructive',
      });
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhook(webhook.id);
    
    try {
      const testPayload = {
        event_type: 'test.webhook',
        data: {
          message: 'Este é um teste do webhook',
          timestamp: new Date().toISOString(),
          webhook_id: webhook.id
        }
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Source': webhook.name,
          ...webhook.headers,
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Webhook testado com sucesso!',
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: 'Erro no Teste',
        description: `Falha ao testar webhook: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setTestingWebhook(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return {
    webhooks,
    loading,
    showCreateDialog,
    setShowCreateDialog,
    newWebhookData,
    setNewWebhookData,
    testingWebhook,
    createWebhook,
    createKwifyWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    formatDate,
  };
}
