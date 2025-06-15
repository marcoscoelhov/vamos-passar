
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface WebhookTestLogsProps {
  logs: string[];
  onClearLogs: () => void;
}

export function WebhookTestLogs({ logs, onClearLogs }: WebhookTestLogsProps) {
  if (logs.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Logs do Teste</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearLogs}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Limpar
        </Button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-auto">
        {logs.map((log, index) => (
          <div key={index} className="mb-1">
            {log}
          </div>
        ))}
      </div>
    </Card>
  );
}
