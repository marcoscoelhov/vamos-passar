
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WebhookTester } from './WebhookTester';
import { WebhookDebugger } from './WebhookDebugger';
import { Bug, TestTube, Activity } from 'lucide-react';

export function WebhookDebugTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Debug e Teste de Webhooks</h3>
        <p className="text-gray-600">
          Ferramentas para depurar e testar o sistema de webhooks
        </p>
      </div>

      <Tabs defaultValue="tester" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tester" className="gap-2">
            <TestTube className="w-4 h-4" />
            Testador
          </TabsTrigger>
          <TabsTrigger value="debugger" className="gap-2">
            <Bug className="w-4 h-4" />
            Debug
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tester">
          <WebhookTester />
        </TabsContent>
        
        <TabsContent value="debugger">
          <WebhookDebugger />
        </TabsContent>
      </Tabs>
    </div>
  );
}
