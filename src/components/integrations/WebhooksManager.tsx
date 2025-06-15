
import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateWebhookDialog } from './webhooks/CreateWebhookDialog';
import { WebhookCard } from './webhooks/WebhookCard';
import { EmptyWebhooksState } from './webhooks/EmptyWebhooksState';
import { WebhookDebugTab } from './webhooks/WebhookDebugTab';
import { useWebhooks } from './webhooks/useWebhooks';
import { Settings, Bug } from 'lucide-react';

export function WebhooksManager() {
  const {
    webhooks,
    loading,
    showCreateDialog,
    setShowCreateDialog,
    newWebhookData,
    setNewWebhookData,
    testingWebhook,
    createWebhook,
    deleteWebhook,
    toggleWebhook,
    testWebhook,
    formatDate
  } = useWebhooks();

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
          <h3 className="text-lg font-semibold">Gerenciamento de Webhooks</h3>
          <p className="text-gray-600">Configure endpoints para receber eventos em tempo real</p>
        </div>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="gap-2">
            <Settings className="w-4 h-4" />
            Gerenciar
          </TabsTrigger>
          <TabsTrigger value="debug" className="gap-2">
            <Bug className="w-4 h-4" />
            Debug & Teste
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage">
          <div className="space-y-4">
            <div className="flex justify-end">
              <CreateWebhookDialog
                isOpen={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                newWebhookData={newWebhookData}
                onNewWebhookDataChange={setNewWebhookData}
                onCreateWebhook={createWebhook}
              />
            </div>

            {webhooks.length === 0 ? (
              <EmptyWebhooksState onCreateWebhook={() => setShowCreateDialog(true)} />
            ) : (
              webhooks.map((webhook) => (
                <WebhookCard
                  key={webhook.id}
                  webhook={webhook}
                  testingWebhook={testingWebhook}
                  onToggle={toggleWebhook}
                  onDelete={deleteWebhook}
                  onTest={testWebhook}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="debug">
          <WebhookDebugTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
