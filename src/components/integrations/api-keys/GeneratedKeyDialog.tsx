
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, AlertTriangle } from 'lucide-react';

interface GeneratedKeyDialogProps {
  generatedKey: string | null;
  onClose: () => void;
  onCopyToClipboard: (text: string) => void;
}

export function GeneratedKeyDialog({ generatedKey, onClose, onCopyToClipboard }: GeneratedKeyDialogProps) {
  return (
    <Dialog open={!!generatedKey} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Chave API Criada</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Importante!</span>
            </div>
            <p className="text-sm text-yellow-700">
              Esta é a única vez que você verá esta chave. Copie e armazene-a em local seguro.
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium">Sua Nova Chave API:</label>
            <div className="flex gap-2 mt-1">
              <Input
                value={generatedKey || ''}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyToClipboard(generatedKey || '')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button onClick={onClose} className="w-full">
            Entendi, fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
