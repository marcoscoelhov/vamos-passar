
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { APIKeysManager } from './APIKeysManager';
import { WebhooksManager } from './WebhooksManager';
import { IntegrationLogs } from './IntegrationLogs';
import { QuickConnectors } from './QuickConnectors';
import { 
  Link2, 
  Key, 
  Webhook, 
  Activity, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

export function IntegrationsHub() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - em produção viria do Supabase
  const stats = {
    apiKeys: 3,
    activeWebhooks: 5,
    totalCalls: 1247,
    successRate: 98.2,
    lastWeekCalls: 186
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Integrações & APIs</h2>
            <p className="text-gray-600">Gerencie APIs, webhooks e conectores externos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Activity className="w-4 h-4" />
            Status das APIs
          </Button>
          <Button className="gap-2">
            <Zap className="w-4 h-4" />
            Nova Integração
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="connectors" className="gap-2">
            <Zap className="w-4 h-4" />
            Conectores
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <Activity className="w-4 h-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span className="font-medium">API Keys Ativas</span>
              </div>
              <p className="text-3xl font-bold">{stats.apiKeys}</p>
              <p className="text-sm text-gray-600">Chaves configuradas</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Webhook className="w-5 h-5 text-green-600" />
                <span className="font-medium">Webhooks</span>
              </div>
              <p className="text-3xl font-bold">{stats.activeWebhooks}</p>
              <p className="text-sm text-gray-600">Endpoints ativos</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Chamadas (Total)</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalCalls.toLocaleString()}</p>
              <p className="text-sm text-gray-600">+{stats.lastWeekCalls} esta semana</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Taxa de Sucesso</span>
              </div>
              <p className="text-3xl font-bold">{stats.successRate}%</p>
              <p className="text-sm text-gray-600">Últimos 30 dias</p>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">APIs Disponíveis</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Courses API</h4>
                    <p className="text-sm text-gray-600">CRUD completo de cursos</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Students API</h4>
                    <p className="text-sm text-gray-600">Gestão de estudantes</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Em Breve</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Analytics API</h4>
                    <p className="text-sm text-gray-600">Métricas e relatórios</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Em Breve</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Eventos de Webhook</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">student.enrolled</h4>
                    <p className="text-sm text-gray-600">Nova matrícula realizada</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">course.completed</h4>
                    <p className="text-sm text-gray-600">Curso concluído</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">payment.confirmed</h4>
                    <p className="text-sm text-gray-600">Pagamento confirmado</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
            <div className="space-y-3">
              {[
                { time: '2 min atrás', action: 'API Call', details: 'GET /api/courses - 200 OK', status: 'success' },
                { time: '5 min atrás', action: 'Webhook Sent', details: 'student.enrolled → Zapier', status: 'success' },
                { time: '12 min atrás', action: 'API Call', details: 'POST /api/courses - 201 Created', status: 'success' },
                { time: '1 hora atrás', action: 'Webhook Failed', details: 'course.completed → Custom URL', status: 'error' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys">
          <APIKeysManager />
        </TabsContent>

        <TabsContent value="webhooks">
          <WebhooksManager />
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
