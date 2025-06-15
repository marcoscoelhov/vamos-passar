
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TestData {
  url: string;
  method: string;
  headers: string;
  payload: string;
}

interface TestResult {
  success: boolean;
  status?: number;
  statusText?: string;
  responseTime?: number;
  response?: any;
  headers?: Record<string, string>;
  error?: string;
}

export function useWebhookTester() {
  const [testData, setTestData] = useState<TestData>({
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
  const [testResult, setTestResult] = useState<TestResult | null>(null);
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

      let payload: any = {};
      try {
        payload = JSON.parse(testData.payload);
        addLog(`Payload parseado com evento: ${payload.event_type || 'sem event_type'}`);
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
        
        setTimeout(checkWebhookLogs, 2000);
      } else {
        addLog(`❌ Webhook falhou com status ${response.status}`);
        toast({
          title: 'Erro no teste',
          description: `Webhook retornou status ${response.status}`,
          variant: 'destructive'
        });
      }

    } catch (error: any) {
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
      
    } catch (error: any) {
      addLog(`Erro ao verificar logs: ${error.message}`);
    }
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

  const clearLogs = () => setLogs([]);

  return {
    testData,
    setTestData,
    testing,
    testResult,
    logs,
    testWebhook,
    loadKwifyTemplate,
    clearLogs
  };
}
