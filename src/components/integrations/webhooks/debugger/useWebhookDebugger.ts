
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WebhookLog, WebhookConfig } from './types';

export function useWebhookDebugger() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      console.log('🔍 [DEBUG] Carregando dados de webhook...');
      
      // Carregar logs
      const { data: logsData, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.error('🔍 [DEBUG] Erro ao carregar logs:', logsError);
        throw logsError;
      }

      // Carregar configurações
      const { data: configsData, error: configsError } = await supabase
        .from('webhook_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (configsError) {
        console.error('🔍 [DEBUG] Erro ao carregar configs:', configsError);
        throw configsError;
      }

      console.log('🔍 [DEBUG] Dados carregados:', {
        logs: logsData?.length || 0,
        configs: configsData?.length || 0
      });

      setLogs(logsData || []);
      setConfigs(configsData || []);
      
    } catch (error) {
      console.error('🔍 [DEBUG] Erro geral:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de debug',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const { error } = await supabase
        .from('webhook_logs')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000');

      if (error) throw error;

      toast({
        title: 'Logs limpos',
        description: 'Todos os logs foram removidos'
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar os logs',
        variant: 'destructive'
      });
    }
  };

  const testNotificationSystem = async () => {
    try {
      console.log('🔔 [DEBUG] Testando sistema de notificações...');
      
      // Inserir um log de teste diretamente
      const testLog = {
        event_type: 'test.notification',
        payload: {
          test: true,
          message: 'Teste do sistema de notificações',
          timestamp: new Date().toISOString()
        },
        status_code: 200
      };

      const { error } = await supabase
        .from('webhook_logs')
        .insert([testLog]);

      if (error) throw error;

      toast({
        title: 'Teste enviado',
        description: 'Verifique se uma notificação apareceu no centro de notificações'
      });

      // Recarregar dados após um delay
      setTimeout(loadData, 1000);
      
    } catch (error: any) {
      console.error('🔔 [DEBUG] Erro no teste:', error);
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return {
    logs,
    configs,
    loading,
    selectedLog,
    setSelectedLog,
    loadData,
    clearLogs,
    testNotificationSystem
  };
}
