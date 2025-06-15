
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Copy,
  RefreshCw
} from 'lucide-react';

export function WebhookTester() {
  const [testData, setTestData] = useState({
    url: 'https://hxrwlshmfgcnyfugbetw.supabase.co/functions/v1/webhook-receiver',
    method: 'POST',
    headers: '{"Content-Type": "application/json", "X-Webhook-Source": "kwify"}',
    payload: JSON.stringify({
      event_type: 'sale.completed',
      data: {
        sale_id: 'test_sale_123',
        product_id: 'test_product_456',
        customer: {
          email: 'test@example.com',
          name: 'Test Customer'
        },
        amount: 197.00
      },
      source: 'kwify'
    }, null, 2)
  });
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    console.log('🧪 [WEBHOOK-TEST]', message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testWebhook = async () => {
    setTesting(true);
    setTestResult(null);
    setLogs([]);
    
    try {
      addLog('Iniciando teste do webhook...');
      
      let headers = {};
      try {
        headers = JSON.parse(testData.headers);
        addLog(`Headers parseados: ${Object.keys(headers).join(', ')}`);
      } catch (e) {
        addLog('Erro ao parsear headers, usando headers padrão');
        headers = { 'Content-Type': 'application/json' };
      }

      let payload = {};
      try {
        payload = JSON.parse(testData.payload);
        addLog(`Payload parseado com evento: ${payload.event_type}`);
      } catch (e) {
        addLog('Erro ao parsear payload');
        throw new Error('Payload JSON inválido');
      }

      addLog(`Enviando ${testData.method} para ${testData.url}`);
      
      const startTime = Date.now();
      const response = await fetch(testData.url, {
        method: testData.method,
        headers,
        body: JSON.stringify(payload)
      });
      const endTime = Date.now();
      
      addLog(`Resposta recebida em ${endTime - startTime}ms`);
      addLog(`Status: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      let responseData = {};
      
      try {
        responseData = JSON.parse(responseText);
        addLog(`Resposta JSON parseada: ${JSON.stringify(responseData, null, 2)}`);
      } catch (e) {
        addLog(`Resposta em texto: ${responseText}`);
        responseData = { text: responseText };
      }

      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime: endTime - startTime,
        response: responseData,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        addLog('✅ Webhook testado com sucesso!');
        toast({
          title: 'Teste realizado',
          description: `Webhook respondeu com status ${response.status}`,
        });
        
        // Aguardar um pouco e verificar se o log foi criado
        setTimeout(checkWebhookLogs, 2000);
      } else {
        addLog(`❌ Webhook falhou com status ${response.status}`);
        toast({
          title: 'Erro no teste',
          description: `Webhook retornou status ${response.status}`,
          variant: 'destructive'
        });
      }

    } catch (error) {
      addLog(`❌ Erro durante o teste: ${error.message}`);
      setTestResult({
        success: false,
        error: error.message
      });
      
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const checkWebhookLogs = async () => {
    try {
      addLog('Verificando logs do webhook...');
      
      const { data: logs, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        addLog(`Erro ao buscar logs: ${error.message}`);
        return;
      }

      addLog(`Encontrados ${logs?.length || 0} logs recentes`);
      
      if (logs && logs.length > 0) {
        const latestLog = logs[0];
        addLog(`Log mais recente: ${latestLog.event_type} - Status: ${latestLog.status_code}`);
      }
      
    } catch (error) {
      addLog(`Erro ao verificar logs: ${error.message}`);
    }
  };

  const copyKwifyUrl = () => {
    navigator.clipboard.writeText(testData.url);
    toast({
      title: 'URL copiada',
      description: 'URL do webhook copiada para a área de transferência'
    });
  };

  const loadKwifyTemplate = () => {
    setTestData({
      url: 'https://hxrwlshmfgcnyfugbetw.supabase.co/functions/v1/webhook-receiver',
      method: 'POST',
      headers: JSON.stringify({
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'kwify',
        'X-Kwify-Signature': 'test_signature'
      }, null, 2),
      payload: JSON.stringify({
        event_type: 'sale.completed',
        data: {
          sale_id: 'kwify_sale_' + Date.now(),
          product_id: 'prod_123',
          customer: {
            email: 'cliente@teste.com',
            name: 'Cliente Teste'
          },
          amount: 197.00,
          status: 'approved'
        },
        source: 'kwify',
        timestamp: new Date().toISOString()
      }, null, 2)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Testador de Webhook</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadKwifyTemplate}
            >
              Template Kwify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyKwifyUrl}
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copiar URL
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="url">URL do Webhook</Label>
              <Input
                id="url"
                value={testData.url}
                onChange={(e) => setTestData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="method">Método HTTP</Label>
              <Select value={testData.method} onValueChange={(value) => setTestData(prev => ({ ...prev, method: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              value={testData.headers}
              onChange={(e) => setTestData(prev => ({ ...prev, headers: e.target.value }))}
              rows={3}
              className="font-mono text-sm"
            />
          </div>

          <div>
            <Label htmlFor="payload">Payload (JSON)</Label>
            <Textarea
              id="payload"
              value={testData.payload}
              onChange={(e) => setTestData(prev => ({ ...prev, payload: e.target.value }))}
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={testWebhook}
            disabled={testing}
            className="gap-2"
          >
            {testing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {testing ? 'Testando...' : 'Testar Webhook'}
          </Button>
        </div>
      </Card>

      {/* Resultado do Teste */}
      {testResult && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <h3 className="text-lg font-semibold">
              {testResult.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
            </h3>
          </div>

          <div className="space-y-4">
            {testResult.status && (
              <div>
                <Badge className={testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {testResult.status} {testResult.statusText}
                </Badge>
                {testResult.responseTime && (
                  <span className="ml-2 text-sm text-gray-500">
                    {testResult.responseTime}ms
                  </span>
                )}
              </div>
            )}

            {testResult.response && (
              <div>
                <Label>Resposta:</Label>
                <pre className="mt-1 p-3 bg-gray-100 rounded text-sm overflow-auto">
                  {JSON.stringify(testResult.response, null, 2)}
                </pre>
              </div>
            )}

            {testResult.error && (
              <div>
                <Label>Erro:</Label>
                <p className="mt-1 p-3 bg-red-50 text-red-800 rounded text-sm">
                  {testResult.error}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Logs do Teste */}
      {logs.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Logs do Teste</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLogs([])}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar
            </Button>
          </div>

          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-auto">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
