
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { WebhookLog } from './types';

interface LogsListProps {
  logs: WebhookLog[];
  onSelectLog: (log: WebhookLog) => void;
}

export function LogsList({ logs, onSelectLog }: LogsListProps) {
  const getStatusIcon = (log: WebhookLog) => {
    if (!log.status_code) return <Clock className="w-4 h-4 text-gray-500" />;
    if (log.status_code >= 200 && log.status_code < 300) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusColor = (log: WebhookLog) => {
    if (!log.status_code) return 'bg-gray-100 text-gray-800';
    if (log.status_code >= 200 && log.status_code < 300) return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (logs.length === 0) {
    return (
      <Card className="p-6">
        <h4 className="text-md font-semibold mb-4">Logs Recentes</h4>
        <div className="text-center py-8 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum log de webhook encontrado</p>
          <p className="text-sm">Use o testador acima para gerar logs</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h4 className="text-md font-semibold mb-4">Logs Recentes</h4>
      
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectLog(log)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(log)}
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        {log.event_type}
                      </Badge>
                      {log.status_code && (
                        <Badge className={getStatusColor(log)}>
                          {log.status_code}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(log.created_at)}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLog(log);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              
              {log.error_message && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {log.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
