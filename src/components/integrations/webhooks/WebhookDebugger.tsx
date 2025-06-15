
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bug, 
  RefreshCw, 
  Database,
  Webhook,
  Bell,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface WebhookLog {
  id: string;
  event_type: string;
  status_code?: number;
  created_at: string;
  payload: any;
  error_message?: string;
  webhook_config_id?: string;
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  events: string[];
  created_at: string;
}

export function WebhookDebugger() {
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
      
    } catch (error) {
      console.error('🔔 [DEBUG] Erro no teste:', error);
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (log: WebhookLog) => {
    if (!log.status_code) return <Clock className="w-4 h-4 text-gray-500" />;
    if (log.status_code >= 200 && log.status_code < 300) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (log: WebhookLog) => {
    if (!log.status_code) return 'bg-gray-100 text-gray-800';
    if (log.status_code >= 200 && log.status_code < 300) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug de Webhooks
          </h3>
          <p className="text-gray-600">
            Monitore e depure o sistema de webhooks em tempo real
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={testNotificationSystem}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            Testar Notificações
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearLogs}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total de Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Webhook className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Configurações Ativas</p>
              <p className="text-2xl font-bold">
                {configs.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Sucessos Recentes</p>
              <p className="text-2xl font-bold">
                {logs.filter(l => l.status_code && l.status_code >= 200 && l.status_code < 300).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lista de Logs */}
      <Card className="p-6">
        <h4 className="text-md font-semibold mb-4">Logs Recentes</h4>
        
        {logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum log de webhook encontrado</p>
            <p className="text-sm">Use o testador acima para gerar logs</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log)}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-100 text-purple-800">
                            {log.event_type}
                          </Badge>
                          {log.status_code && (
                            <Badge className={getStatusColor(log)}>
                              {log.status_code}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(log.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {log.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      {log.error_message}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Detalhes do Log Selecionado */}
      {selectedLog && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold">Detalhes do Log</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLog(null)}
            >
              Fechar
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Evento:</strong> {selectedLog.event_type}
              </div>
              <div>
                <strong>Status:</strong> {selectedLog.status_code || 'Pendente'}
              </div>
              <div>
                <strong>Data:</strong> {formatDate(selectedLog.created_at)}
              </div>
              <div>
                <strong>ID:</strong> {selectedLog.id}
              </div>
            </div>
            
            <div>
              <strong>Payload:</strong>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            </div>
            
            {selectedLog.error_message && (
              <div>
                <strong>Erro:</strong>
                <p className="mt-2 p-3 bg-red-50 text-red-800 rounded text-sm">
                  {selectedLog.error_message}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
