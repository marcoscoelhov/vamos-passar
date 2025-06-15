
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { AVAILABLE_EVENTS } from './constants';
import type { NewWebhookData } from './types';

interface CreateWebhookDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newWebhookData: NewWebhookData;
  onNewWebhookDataChange: (data: NewWebhookData) => void;
  onCreateWebhook: () => void;
}

export function CreateWebhookDialog({
  isOpen,
  onOpenChange,
  newWebhookData,
  onNewWebhookDataChange,
  onCreateWebhook
}: CreateWebhookDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Webhook
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Webhook</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome do Webhook</label>
              <Input
                placeholder="ex: Notificações Zapier"
                value={newWebhookData.name}
                onChange={(e) => onNewWebhookDataChange({ ...newWebhookData, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">URL do Endpoint</label>
              <Input
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={newWebhookData.url}
                onChange={(e) => onNewWebhookDataChange({ ...newWebhookData, url: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Eventos para Escutar</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {AVAILABLE_EVENTS.map((event) => (
                <div key={event.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={event.id}
                    checked={newWebhookData.events.includes(event.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onNewWebhookDataChange({
                          ...newWebhookData,
                          events: [...newWebhookData.events, event.id]
                        });
                      } else {
                        onNewWebhookDataChange({
                          ...newWebhookData,
                          events: newWebhookData.events.filter(e => e !== event.id)
                        });
                      }
                    }}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={event.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {event.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Token Secreto (opcional)</label>
              <Input
                type="password"
                placeholder="Para validação de assinatura"
                value={newWebhookData.secret_token}
                onChange={(e) => onNewWebhookDataChange({ ...newWebhookData, secret_token: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Tentativas</label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newWebhookData.retry_count}
                onChange={(e) => onNewWebhookDataChange({ ...newWebhookData, retry_count: parseInt(e.target.value) })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Timeout (seg)</label>
              <Input
                type="number"
                min="5"
                max="120"
                value={newWebhookData.timeout_seconds}
                onChange={(e) => onNewWebhookDataChange({ ...newWebhookData, timeout_seconds: parseInt(e.target.value) })}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Headers Customizados (JSON)</label>
            <Textarea
              placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
              value={newWebhookData.headers}
              onChange={(e) => onNewWebhookDataChange({ ...newWebhookData, headers: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onCreateWebhook} 
              disabled={!newWebhookData.name || !newWebhookData.url || newWebhookData.events.length === 0}
            >
              Criar Webhook
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
