
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Key, Copy, Eye, EyeOff, Trash2, Calendar, Activity } from 'lucide-react';
import type { APIKey } from './types';

interface APIKeyCardProps {
  apiKey: APIKey;
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onCopyToClipboard: (text: string) => void;
  formatDate: (dateString: string | null) => string;
}

export function APIKeyCard({ apiKey, onToggle, onDelete, onCopyToClipboard, formatDate }: APIKeyCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold">{apiKey.name}</h4>
            <Badge className={apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {apiKey.is_active ? 'Ativa' : 'Inativa'}
            </Badge>
            {apiKey.expires_at && new Date(apiKey.expires_at) < new Date() && (
              <Badge className="bg-red-100 text-red-800">Expirada</Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Chave</p>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                  {apiKey.key_prefix}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyToClipboard(apiKey.key_prefix)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Permissões</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {apiKey.permissions.map((permission) => (
                  <Badge key={permission} variant="outline" className="text-xs">
                    {permission.split(':')[1]}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Último Uso</p>
              <div className="flex items-center gap-1 text-sm">
                <Activity className="w-3 h-3" />
                {formatDate(apiKey.last_used_at)}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="text-sm text-gray-600">Rate Limit</p>
              <p className="text-sm font-medium">{apiKey.rate_limit} req/min</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Expira em</p>
              <div className="flex items-center gap-1 text-sm">
                <Calendar className="w-3 h-3" />
                {apiKey.expires_at ? formatDate(apiKey.expires_at) : 'Nunca'}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(apiKey.id, apiKey.is_active)}
          >
            {apiKey.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover Chave API</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover a chave "{apiKey.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(apiKey.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
}
