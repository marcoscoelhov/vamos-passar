
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Webhook, Globe, Clock, TestTube, Trash2 } from 'lucide-react';
import type { WebhookConfig } from './types';

interface WebhookCardProps {
  webhook: WebhookConfig;
  testingWebhook: string | null;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onTest: (webhook: WebhookConfig) => void;
  formatDate: (dateString: string) => string;
}

export function WebhookCard({
  webhook,
  testingWebhook,
  onToggle,
  onDelete,
  onTest,
  formatDate
}: WebhookCardProps) {
  return (
    <Card key={webhook.id} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Webhook className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold">{webhook.name}</h4>
            <Badge className={webhook.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {webhook.is_active ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">URL do Endpoint</p>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                  {webhook.url}
                </code>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Eventos Configurados</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {webhook.events.map((event) => (
                  <Badge key={event} variant="outline" className="text-xs">
                    {event}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tentativas</p>
                <p className="text-sm font-medium">{webhook.retry_count} tentativas</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Timeout</p>
                <p className="text-sm font-medium">{webhook.timeout_seconds}s</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Criado em</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="w-3 h-3" />
                  {formatDate(webhook.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(webhook)}
            disabled={testingWebhook === webhook.id || !webhook.is_active}
            className="gap-2"
          >
            <TestTube className="w-4 h-4" />
            {testingWebhook === webhook.id ? 'Testando...' : 'Testar'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(webhook.id, webhook.is_active)}
          >
            {webhook.is_active ? 'Desativar' : 'Ativar'}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover Webhook</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover o webhook "{webhook.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(webhook.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
