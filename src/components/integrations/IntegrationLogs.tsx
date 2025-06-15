
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  RefreshCw, 
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Key,
  Webhook
} from 'lucide-react';

interface APILog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  created_at: string;
  api_key_id?: string;
  error_message?: string;
}

interface WebhookLog {
  id: string;
  event_type: string;
  status_code?: number;
  retry_attempt: number;
  sent_at?: string;
  created_at: string;
  webhook_config_id?: string;
  error_message?: string;
}

export function IntegrationLogs() {
  const [apiLogs, setApiLogs] = useState<APILog[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'api' | 'webhook'>('api');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const loadLogs = async () => {
    try {
      if (activeTab === 'api') {
        const { data, error } = await supabase
          .from('api_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setApiLogs(data || []);
      } else {
        const { data, error } = await supabase
          .from('webhook_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setWebhookLogs(data || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statusCode?: number) => {
    if (!statusCode) return 'bg-gray-100 text-gray-800';
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-100 text-green-800';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-100 text-yellow-800';
    if (statusCode >= 500) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (statusCode?: number) => {
    if (!statusCode) return <Clock className="w-4 h-4 text-gray-600" />;
    if (statusCode >= 200 && statusCode < 300) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const filteredApiLogs = apiLogs.filter(log => {
    const matchesSearch = log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.method.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'success' && log.status_code >= 200 && log.status_code < 300) ||
                         (statusFilter === 'error' && log.status_code >= 400) ||
                         (statusFilter === 'slow' && (log.response_time_ms || 0) > 1000);
    
    return matchesSearch && matchesStatus;
  });

  const filteredWebhookLogs = webhookLogs.filter(log => {
    const matchesSearch = log.event_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'success' && log.status_code && log.status_code >= 200 && log.status_code < 300) ||
                         (statusFilter === 'error' && (!log.status_code || log.status_code >= 400)) ||
                         (statusFilter === 'retry' && log.retry_attempt > 0);
    
    return matchesSearch && matchesStatus;
  });

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
          <h3 className="text-lg font-semibold">Logs de Integração</h3>
          <p className="text-gray-600">Monitore chamadas de API e webhooks em tempo real</p>
        </div>
        
        <Button onClick={loadLogs} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'api' ? 'default' : 'outline'}
            onClick={() => setActiveTab('api')}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            API Logs
          </Button>
          <Button
            variant={activeTab === 'webhook' ? 'default' : 'outline'}
            onClick={() => setActiveTab('webhook')}
            className="gap-2"
          >
            <Webhook className="w-4 h-4" />
            Webhook Logs
          </Button>
        </div>
        
        <div className="flex gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              {activeTab === 'api' ? (
                <SelectItem value="slow">Lentos (&gt;1s)</SelectItem>
              ) : (
                <SelectItem value="retry">Com Retry</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* API Logs */}
      {activeTab === 'api' && (
        <div className="space-y-4">
          {filteredApiLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum log de API</h3>
              <p className="text-gray-600">Os logs de chamadas API aparecerão aqui.</p>
            </Card>
          ) : (
            filteredApiLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status_code)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="font-mono text-xs">
                          {log.method}
                        </Badge>
                        <code className="text-sm">{log.endpoint}</code>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <Badge className={getStatusColor(log.status_code)}>
                        {log.status_code}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Status</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-medium">{formatDuration(log.response_time_ms)}</p>
                      <p className="text-xs text-gray-500">Tempo</p>
                    </div>
                  </div>
                </div>
                
                {log.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{log.error_message}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Webhook Logs */}
      {activeTab === 'webhook' && (
        <div className="space-y-4">
          {filteredWebhookLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum log de webhook</h3>
              <p className="text-gray-600">Os logs de webhooks enviados aparecerão aqui.</p>
            </Card>
          ) : (
            filteredWebhookLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(log.status_code)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-800">
                          {log.event_type}
                        </Badge>
                        {log.retry_attempt > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Retry #{log.retry_attempt}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <Badge className={getStatusColor(log.status_code)}>
                        {log.status_code || 'Pendente'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Status</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="font-medium">
                        {log.sent_at ? formatDate(log.sent_at) : 'Não enviado'}
                      </p>
                      <p className="text-xs text-gray-500">Enviado</p>
                    </div>
                  </div>
                </div>
                
                {log.error_message && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{log.error_message}</p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
