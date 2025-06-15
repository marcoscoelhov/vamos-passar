
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WebhookLog } from './types';

interface LogDetailsProps {
  log: WebhookLog;
  onClose: () => void;
}

export function LogDetails({ log, onClose }: LogDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold">Detalhes do Log</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong>Evento:</strong> {log.event_type}
          </div>
          <div>
            <strong>Status:</strong> {log.status_code || 'Pendente'}
          </div>
          <div>
            <strong>Data:</strong> {formatDate(log.created_at)}
          </div>
          <div>
            <strong>ID:</strong> {log.id}
          </div>
        </div>
        
        <div>
          <strong>Payload:</strong>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto">
            {JSON.stringify(log.payload, null, 2)}
          </pre>
        </div>
        
        {log.error_message && (
          <div>
            <strong>Erro:</strong>
            <p className="mt-2 p-3 bg-red-50 text-red-800 rounded text-sm">
              {log.error_message}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
