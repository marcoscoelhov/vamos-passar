
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Webhook, 
  Key, 
  Activity, 
  Zap, 
  ShoppingCart,
  Database,
  BarChart3
} from 'lucide-react';
import { WebhooksManager } from './WebhooksManager';
import { APIKeysManager } from './APIKeysManager';
import { IntegrationLogs } from './IntegrationLogs';
import { QuickConnectors } from './QuickConnectors';
import { KwifyProductMapping } from './KwifyProductMapping';

export function IntegrationsHub() {
  const [activeTab, setActiveTab] = useState('overview');

  const integrationStats = [
    {
      title: 'Webhooks Ativos',
      value: '3',
      icon: Webhook,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'API Keys',
      value: '2',
      icon: Key,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Eventos Hoje',
      value: '47',
      icon: Activity,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Integrações',
      value: '5',
      icon: Zap,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const availableIntegrations = [
    {
      name: 'Kwify',
      description: 'Integração com plataforma de vendas',
      status: 'connected',
      icon: ShoppingCart,
      features: ['Matrículas automáticas', 'Sincronização de vendas', 'Webhooks']
    },
    {
      name: 'Zapier',
      description: 'Conecte com milhares de aplicativos',
      status: 'available',
      icon: Zap,
      features: ['Automações', 'Workflows', 'Triggers']
    },
    {
      name: 'Google Analytics',
      description: 'Análise de tráfego e comportamento',
      status: 'available',
      icon: BarChart3,
      features: ['Tracking', 'Relatórios', 'Métricas']
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Centro de Integrações</h2>
          <p className="text-gray-600">
            Gerencie conexões externas, webhooks e APIs do seu sistema
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          Sistema Ativo
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {integrationStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="kwify">Kwify</TabsTrigger>
          <TabsTrigger value="connectors">Conectores</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Available Integrations */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Integrações Disponíveis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableIntegrations.map((integration, index) => {
                const Icon = integration.icon;
                return (
                  <Card key={index} className="p-4 border-2 hover:border-blue-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{integration.name}</h4>
                          <Badge 
                            variant={integration.status === 'connected' ? 'default' : 'secondary'}
                            className={integration.status === 'connected' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {integration.status === 'connected' ? 'Conectado' : 'Disponível'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
                        <div className="space-y-1">
                          {integration.features.map((feature, idx) => (
                            <p key={idx} className="text-xs text-gray-500">• {feature}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>

          {/* Quick Setup */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configuração Rápida</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Para começar:</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>1. Configure um webhook para receber eventos</p>
                  <p>2. Crie uma API key para autenticação</p>
                  <p>3. Configure o mapeamento de produtos (Kwify)</p>
                  <p>4. Teste a integração nos logs</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">URL do Webhook:</h4>
                <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                  https://hxrwlshmfgcnyfugbetw.supabase.co/functions/v1/webhook-receiver
                </div>
                <p className="text-xs text-gray-500">
                  Use esta URL em suas integrações externas para enviar eventos
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager />
        </TabsContent>

        <TabsContent value="api-keys">
          <APIKeysManager />
        </TabsContent>

        <TabsContent value="kwify">
          <KwifyProductMapping />
        </TabsContent>

        <TabsContent value="connectors">
          <QuickConnectors />
        </TabsContent>

        <TabsContent value="logs">
          <IntegrationLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
}
