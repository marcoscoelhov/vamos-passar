
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContentVersion } from './types';

interface DraftManagementProps {
  versions: ContentVersion[];
}

export function DraftManagement({ versions }: DraftManagementProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  const drafts = versions.filter(v => !v.isPublished);

  return (
    <div className="space-y-4">
      {drafts.map(version => (
        <Card key={version.id} className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Versão {version.version}</h3>
              <p className="text-sm text-gray-600">{version.title}</p>
              <p className="text-xs text-gray-500">
                Criado por {version.author} em {formatDate(version.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Editar</Button>
              <Button size="sm">Publicar</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
