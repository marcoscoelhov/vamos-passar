
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Globe, 
  Link, 
  ExternalLink,
  Copy,
  CheckCircle,
  Webhook,
  Send
} from 'lucide-react';

export function QuickConnectors() {
  const [zapierUrl, setZapierUrl] = useState('');
  const [customWebhookUrl, setCustomWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const supabaseUrl = "https://hxrwlshmfgcnyfugbetw.supabase.co";

  const handleZapierConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!zapierUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do Zapier webhook",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(zapierUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          event_type: "test.zapier",
          timestamp: new Date().toISOString(),
          data: {
            message: "Teste de conexão com Zapier",
            source: "LMS System",
            test_id: Math.random().toString(36).substr(2, 9)
          }
        }),
      });

      toast({
        title: "Teste enviado!",
        description: "A requisição foi enviada para o Zapier. Verifique o histórico do seu Zap para confirmar.",
      });
    } catch (error) {
      console.error("Error testing Zapier:", error);
      toast({
        title: "Erro",
        description: "Falha ao enviar teste para o Zapier. Verifique a URL e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customWebhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do webhook",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(customWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Source": "lms-system",
          "User-Agent": "LMS-Webhook/1.0"
        },
        body: JSON.stringify({
          event_type: "test.custom",
          timestamp: new Date().toISOString(),
          data: {
            message: "Teste de webhook customizado",
            source: "LMS System",
            test_id: Math.random().toString(36).substr(2, 9)
          }
        }),
      });

      if (response.ok) {
        toast({
          title: "Teste enviado com sucesso!",
          description: `Webhook testado com status ${response.status}`,
        });
      } else {
        toast({
          title: "Erro no teste",
          description: `Webhook retornou status ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Erro",
        description: "Falha ao testar webhook. Verifique a URL e conectividade.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência"
    });
  };

  const connectors = [
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Conecte com mais de 5.000+ aplicativos',
      icon: <Zap className="w-8 h-8 text-orange-600" />,
      status: 'available',
      category: 'automation'
    },
    {
      id: 'custom-webhook',
      name: 'Webhook Customizado',
      description: 'Configure seu próprio endpoint HTTP',
      icon: <Webhook className="w-8 h-8 text-blue-600" />,
      status: 'available',
      category: 'custom'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Notificações e integrações com Slack',
      icon: <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white font-bold">S</div>,
      status: 'coming-soon',
      category: 'communication'
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Integrações com Microsoft Teams',
      icon: <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">T</div>,
      status: 'coming-soon',
      category: 'communication'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Conectores Rápidos</h3>
        <p className="text-gray-600">Configure integrações com serviços populares</p>
      </div>

      {/* Quick Setup Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Zapier Connector */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-orange-600" />
            <div>
              <h4 className="font-semibold">Conectar com Zapier</h4>
              <p className="text-sm text-gray-600">Automatize workflows com 5.000+ apps</p>
            </div>
          </div>

          <form onSubmit={handleZapierConnect} className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL do Zapier Webhook</label>
              <Input
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={zapierUrl}
                onChange={(e) => setZapierUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Copie a URL do webhook trigger do seu Zap
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Testando...' : 'Testar Conexão'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open('https://zapier.com/apps/webhook/integrations', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>

        {/* Custom Webhook */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Webhook className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-semibold">Webhook Customizado</h4>
              <p className="text-sm text-gray-600">Configure seu próprio endpoint</p>
            </div>
          </div>

          <form onSubmit={handleCustomWebhook} className="space-y-4">
            <div>
              <label className="text-sm font-medium">URL do Webhook</label>
              <Input
                placeholder="https://sua-api.com/webhook"
                value={customWebhookUrl}
                onChange={(e) => setCustomWebhookUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Endpoint que receberá os eventos POST
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Testando...' : 'Testar Webhook'}
            </Button>
          </form>
        </Card>
      </div>

      {/* API Information */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Informações da API</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Base URL da API</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={`${supabaseUrl}/functions/v1`}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`${supabaseUrl}/functions/v1`)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Endpoint de Webhooks Incoming</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={`${supabaseUrl}/functions/v1/webhook-receiver`}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`${supabaseUrl}/functions/v1/webhook-receiver`)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Como usar:</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use uma API Key válida no header `X-API-Key`</li>
              <li>• Para webhooks, adicione o header `X-Webhook-Source`</li>
              <li>• Todos os payloads devem ser em formato JSON</li>
              <li>• Verifique os logs para debugging</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Available Connectors */}
      <div>
        <h4 className="font-semibold mb-4">Todos os Conectores</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map((connector) => (
            <Card key={connector.id} className="p-4">
              <div className="flex items-start gap-3">
                {connector.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium">{connector.name}</h5>
                    <Badge 
                      className={
                        connector.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {connector.status === 'available' ? 'Disponível' : 'Em Breve'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{connector.description}</p>
                </div>
              </div>
              
              {connector.status === 'available' && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    <Link className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
