
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Globe, Link, CheckCircle, AlertTriangle, Settings, Sync, Download, Upload } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'lms' | 'sso' | 'analytics' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config: Record<string, any>;
}

export function LMSIntegration() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'moodle',
      name: 'Moodle',
      description: 'Sistema de gestão de aprendizagem mais usado no mundo',
      type: 'lms',
      status: 'connected',
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      config: {
        url: 'https://escola.moodle.com',
        apiKey: '***********',
        autoSync: true,
        syncInterval: 'hourly'
      }
    },
    {
      id: 'canvas',
      name: 'Canvas LMS',
      description: 'Plataforma educacional moderna e intuitiva',
      type: 'lms',
      status: 'disconnected',
      config: {}
    },
    {
      id: 'google-sso',
      name: 'Google SSO',
      description: 'Login único com contas Google',
      type: 'sso',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000).toISOString(),
      config: {
        clientId: 'google-client-id',
        domain: 'escola.edu.br',
        autoCreateUsers: true
      }
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Análise avançada de comportamento dos usuários',
      type: 'analytics',
      status: 'error',
      config: {
        trackingId: 'GA-XXXXX-X',
        enhancedEcommerce: false
      }
    }
  ]);

  const [newIntegrationUrl, setNewIntegrationUrl] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Nunca';
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}m atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return `${Math.floor(diffMinutes / 1440)}d atrás`;
  };

  const handleSync = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, lastSync: new Date().toISOString() }
          : integration
      )
    );
  };

  const toggleIntegration = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === integrationId
          ? { 
              ...integration, 
              status: integration.status === 'connected' ? 'disconnected' : 'connected',
              lastSync: integration.status === 'disconnected' ? new Date().toISOString() : integration.lastSync
            }
          : integration
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Integrações LMS</h2>
        </div>
        <Button className="gap-2">
          <Globe className="w-4 h-4" />
          Nova Integração
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="lms">Sistemas LMS</TabsTrigger>
          <TabsTrigger value="auth">Autenticação</TabsTrigger>
          <TabsTrigger value="sync">Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Conectadas</span>
              </div>
              <p className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Com Problemas</span>
              </div>
              <p className="text-2xl font-bold">
                {integrations.filter(i => i.status === 'error').length}
              </p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Sync className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Última Sincronização</span>
              </div>
              <p className="text-sm text-gray-600">
                {formatLastSync(
                  integrations
                    .filter(i => i.lastSync)
                    .sort((a, b) => new Date(b.lastSync!).getTime() - new Date(a.lastSync!).getTime())[0]?.lastSync
                )}
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status das Integrações</h3>
            <div className="space-y-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-600">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(integration.status)}>
                      {integration.status === 'connected' ? 'Conectado' : 
                       integration.status === 'error' ? 'Erro' : 'Desconectado'}
                    </Badge>
                    {integration.status === 'connected' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id)}
                        className="gap-2"
                      >
                        <Sync className="w-3 h-3" />
                        Sincronizar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="lms" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configurar Nova Integração LMS</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="URL do LMS (ex: https://escola.moodle.com)" />
                <Input placeholder="Chave da API" type="password" />
              </div>
              <div className="flex gap-2">
                <Button>Testar Conexão</Button>
                <Button variant="outline">Salvar Configuração</Button>
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            {integrations.filter(i => i.type === 'lms').map((integration) => (
              <Card key={integration.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(integration.status)}
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-600">
                        Última sincronização: {formatLastSync(integration.lastSync)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={integration.status === 'connected'}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                    />
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {integration.status === 'connected' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Cursos Sincronizados</p>
                      <p className="text-xl font-bold text-blue-600">12</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Usuários Sincronizados</p>
                      <p className="text-xl font-bold text-green-600">1,247</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Próxima Sincronização</p>
                      <p className="text-sm font-medium">Em 45 min</p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configurações de Autenticação</h3>
            <div className="space-y-6">
              {integrations.filter(i => i.type === 'sso').map((integration) => (
                <div key={integration.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(integration.status)}
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={integration.status === 'connected'}
                      onCheckedChange={() => toggleIntegration(integration.id)}
                    />
                  </div>

                  {integration.status === 'connected' && (
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Criar usuários automaticamente</span>
                        <Switch checked={integration.config.autoCreateUsers} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Domínio permitido</span>
                        <span className="text-sm font-medium">{integration.config.domain}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configurações de Sincronização</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Sincronização Automática</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sincronizar cursos</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sincronizar usuários</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sincronizar notas</span>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Frequência</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Intervalo de sincronização</span>
                    <select className="text-sm border rounded px-2 py-1">
                      <option>A cada hora</option>
                      <option>A cada 6 horas</option>
                      <option>Diariamente</option>
                      <option>Semanalmente</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sincronização Manual</h4>
                  <p className="text-sm text-gray-600">Sincronize dados imediatamente</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Importar
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Exportar
                  </Button>
                  <Button className="gap-2">
                    <Sync className="w-4 h-4" />
                    Sincronizar Agora
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Sincronização</h3>
            <div className="space-y-3">
              {[
                { time: '2 horas atrás', type: 'Automática', status: 'Sucesso', items: '45 usuários, 12 cursos' },
                { time: '1 dia atrás', type: 'Manual', status: 'Sucesso', items: '156 usuários, 8 cursos' },
                { time: '2 dias atrás', type: 'Automática', status: 'Erro', items: 'Falha na conexão' },
              ].map((sync, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{sync.type}</p>
                      <p className="text-xs text-gray-600">{sync.items}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={sync.status === 'Sucesso' ? getStatusColor('connected') : getStatusColor('error')}>
                      {sync.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{sync.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
