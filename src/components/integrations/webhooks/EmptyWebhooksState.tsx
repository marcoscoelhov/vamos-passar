
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Webhook, Plus } from 'lucide-react';

interface EmptyWebhooksStateProps {
  onCreateWebhook: () => void;
}

export function EmptyWebhooksState({ onCreateWebhook }: EmptyWebhooksStateProps) {
  return (
    <Card className="p-8 text-center">
      <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum webhook configurado</h3>
      <p className="text-gray-600 mb-4">Configure webhooks para receber eventos automaticamente.</p>
      <Button onClick={onCreateWebhook} className="gap-2">
        <Plus className="w-4 h-4" />
        Criar Primeiro Webhook
      </Button>
    </Card>
  );
}
