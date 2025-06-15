
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug, Bell, Trash2, RefreshCw } from 'lucide-react';

interface DebuggerHeaderProps {
  onTestNotifications: () => void;
  onClearLogs: () => void;
  onRefresh: () => void;
}

export function DebuggerHeader({ 
  onTestNotifications, 
  onClearLogs, 
  onRefresh 
}: DebuggerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Debug de Webhooks
        </h3>
        <p className="text-gray-600">
          Monitore e depure o sistema de webhooks em tempo real
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onTestNotifications}
          className="gap-2"
        >
          <Bell className="w-4 h-4" />
          Testar Notificações
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearLogs}
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Limpar Logs
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>
    </div>
  );
}
