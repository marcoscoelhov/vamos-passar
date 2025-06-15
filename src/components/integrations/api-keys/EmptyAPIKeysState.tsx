
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Plus } from 'lucide-react';

interface EmptyAPIKeysStateProps {
  onCreateKey: () => void;
}

export function EmptyAPIKeysState({ onCreateKey }: EmptyAPIKeysStateProps) {
  return (
    <Card className="p-8 text-center">
      <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma chave API</h3>
      <p className="text-gray-600 mb-4">Crie sua primeira chave API para começar a integrar.</p>
      <Button onClick={onCreateKey} className="gap-2">
        <Plus className="w-4 h-4" />
        Criar Primeira Chave
      </Button>
    </Card>
  );
}
