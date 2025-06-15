
import React from 'react';
import { Card } from '@/components/ui/card';
import { Database, Webhook, CheckCircle } from 'lucide-react';
import { WebhookLog, WebhookConfig } from './types';

interface DebuggerStatsProps {
  logs: WebhookLog[];
  configs: WebhookConfig[];
}

export function DebuggerStats({ logs, configs }: DebuggerStatsProps) {
  const successfulLogs = logs.filter(l => l.status_code && l.status_code >= 200 && l.status_code < 300).length;
  const activeConfigs = configs.filter(c => c.is_active).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-600">Total de Logs</p>
            <p className="text-2xl font-bold">{logs.length}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Webhook className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Configurações Ativas</p>
            <p className="text-2xl font-bold">{activeConfigs}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-green-500" />
          <div>
            <p className="text-sm text-gray-600">Sucessos Recentes</p>
            <p className="text-2xl font-bold">{successfulLogs}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
