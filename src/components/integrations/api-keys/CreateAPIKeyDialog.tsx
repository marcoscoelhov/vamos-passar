
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { AVAILABLE_PERMISSIONS } from './constants';
import type { NewKeyData } from './types';

interface CreateAPIKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newKeyData: NewKeyData;
  onNewKeyDataChange: (data: NewKeyData) => void;
  onCreateKey: () => void;
}

export function CreateAPIKeyDialog({
  isOpen,
  onOpenChange,
  newKeyData,
  onNewKeyDataChange,
  onCreateKey
}: CreateAPIKeyDialogProps) {
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      onNewKeyDataChange({
        ...newKeyData,
        permissions: [...newKeyData.permissions, permissionId]
      });
    } else {
      onNewKeyDataChange({
        ...newKeyData,
        permissions: newKeyData.permissions.filter(p => p !== permissionId)
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Chave API
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Chave API</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nome da Chave</label>
            <Input
              placeholder="ex: Integração Mobile"
              value={newKeyData.name}
              onChange={(e) => onNewKeyDataChange({ ...newKeyData, name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Permissões</label>
            <div className="space-y-2 mt-2">
              {AVAILABLE_PERMISSIONS.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={permission.id}
                    checked={newKeyData.permissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={permission.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Rate Limit (req/min)</label>
            <Input
              type="number"
              value={newKeyData.rate_limit}
              onChange={(e) => onNewKeyDataChange({ ...newKeyData, rate_limit: parseInt(e.target.value) })}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Data de Expiração (opcional)</label>
            <Input
              type="datetime-local"
              value={newKeyData.expires_at}
              onChange={(e) => onNewKeyDataChange({ ...newKeyData, expires_at: e.target.value })}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={onCreateKey} disabled={!newKeyData.name || newKeyData.permissions.length === 0}>
              Criar Chave
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
