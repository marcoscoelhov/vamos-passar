
import React from 'react';
import { Card } from '@/components/ui/card';
import { CreateAPIKeyDialog } from './api-keys/CreateAPIKeyDialog';
import { GeneratedKeyDialog } from './api-keys/GeneratedKeyDialog';
import { APIKeyCard } from './api-keys/APIKeyCard';
import { EmptyAPIKeysState } from './api-keys/EmptyAPIKeysState';
import { useAPIKeys } from './api-keys/useAPIKeys';

export function APIKeysManager() {
  const {
    apiKeys,
    loading,
    showCreateDialog,
    setShowCreateDialog,
    newKeyData,
    setNewKeyData,
    generatedKey,
    setGeneratedKey,
    createAPIKey,
    deleteAPIKey,
    toggleAPIKey,
    copyToClipboard,
    formatDate
  } = useAPIKeys();

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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciamento de API Keys</h3>
          <p className="text-gray-600">Controle o acesso às suas APIs com chaves seguras</p>
        </div>
        
        <CreateAPIKeyDialog
          isOpen={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          newKeyData={newKeyData}
          onNewKeyDataChange={setNewKeyData}
          onCreateKey={createAPIKey}
        />
      </div>

      <GeneratedKeyDialog
        generatedKey={generatedKey}
        onClose={() => setGeneratedKey(null)}
        onCopyToClipboard={copyToClipboard}
      />

      <div className="space-y-4">
        {apiKeys.length === 0 ? (
          <EmptyAPIKeysState onCreateKey={() => setShowCreateDialog(true)} />
        ) : (
          apiKeys.map((apiKey) => (
            <APIKeyCard
              key={apiKey.id}
              apiKey={apiKey}
              onToggle={toggleAPIKey}
              onDelete={deleteAPIKey}
              onCopyToClipboard={copyToClipboard}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}
