
import React from 'react';
import { Card } from '@/components/ui/card';
import { useWebhookDebugger } from './debugger/useWebhookDebugger';
import { DebuggerHeader } from './debugger/DebuggerHeader';
import { DebuggerStats } from './debugger/DebuggerStats';
import { LogsList } from './debugger/LogsList';
import { LogDetails } from './debugger/LogDetails';

export function WebhookDebugger() {
  const {
    logs,
    configs,
    loading,
    selectedLog,
    setSelectedLog,
    loadData,
    clearLogs,
    testNotificationSystem
  } = useWebhookDebugger();

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
      <DebuggerHeader
        onTestNotifications={testNotificationSystem}
        onClearLogs={clearLogs}
        onRefresh={loadData}
      />

      <DebuggerStats logs={logs} configs={configs} />

      <LogsList logs={logs} onSelectLog={setSelectedLog} />

      {selectedLog && (
        <LogDetails 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </div>
  );
}
