
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GitBranch, Clock, User, RotateCcw, Eye, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ContentVersion } from './types';

interface VersionTimelineProps {
  versions: ContentVersion[];
  onPreviewVersion: (version: ContentVersion) => void;
  onRestoreVersion: (version: ContentVersion) => void;
}

export function VersionTimeline({ versions, onPreviewVersion, onRestoreVersion }: VersionTimelineProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
    <div className="relative">
      {/* Linha do tempo vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
      
      <div className="space-y-6">
        {versions.map((version, index) => (
          <div key={version.id} className="relative flex items-start gap-4">
            {/* Indicador da linha do tempo */}
            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
              version.isCurrent 
                ? 'bg-green-100 border-2 border-green-500' 
                : version.isPublished 
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-100 border-2 border-gray-300'
            }`}>
              {version.isCurrent ? (
                <GitBranch className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-600" />
              )}
            </div>

            {/* Card da versão */}
            <Card className="flex-1 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">Versão {version.version}</h3>
                    {version.isCurrent && (
                      <Badge className="bg-green-100 text-green-800">Atual</Badge>
                    )}
                    {version.isPublished && !version.isCurrent && (
                      <Badge variant="outline">Publicada</Badge>
                    )}
                    {!version.isPublished && (
                      <Badge variant="secondary">Rascunho</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{version.title}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {version.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(version.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreviewVersion(version)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {!version.isCurrent && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Restaurar Versão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja restaurar a versão {version.version}? 
                            Esta ação criará uma nova versão baseada na selecionada.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onRestoreVersion(version)}>
                            Restaurar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  {!version.isPublished && (
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Lista de mudanças */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700">Principais mudanças:</p>
                <ul className="list-disc list-inside space-y-1">
                  {version.changes.map((change, i) => (
                    <li key={i} className="text-xs text-gray-600">{change}</li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
