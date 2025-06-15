
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { History, GitBranch, Clock, User, RotateCcw, Eye, Download, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContentVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  changes: string[];
  isPublished: boolean;
  isCurrent: boolean;
}

interface ContentVersioningProps {
  topicId: string;
  currentContent: string;
  onRestoreVersion: (version: ContentVersion) => void;
}

export function ContentVersioning({ topicId, currentContent, onRestoreVersion }: ContentVersioningProps) {
  const [versions] = useState<ContentVersion[]>([
    {
      id: '1',
      version: '3.0',
      title: 'Introdução ao React - Versão Atual',
      content: currentContent,
      author: 'Prof. João Silva',
      createdAt: new Date().toISOString(),
      changes: ['Adicionou seção sobre Hooks', 'Corrigiu exemplos de código', 'Melhorou explicações'],
      isPublished: true,
      isCurrent: true,
    },
    {
      id: '2',
      version: '2.1',
      title: 'Introdução ao React - Revisão',
      content: 'Versão anterior do conteúdo...',
      author: 'Prof. Maria Santos',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      changes: ['Adicionou exercícios práticos', 'Reorganizou estrutura'],
      isPublished: true,
      isCurrent: false,
    },
    {
      id: '3',
      version: '2.0',
      title: 'Introdução ao React - Draft',
      content: 'Rascunho da versão...',
      author: 'Prof. João Silva',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      changes: ['Versão inicial do tópico'],
      isPublished: false,
      isCurrent: false,
    },
  ]);

  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);

  const handlePreviewVersion = (version: ContentVersion) => {
    setSelectedVersion(version);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Histórico de Versões</h2>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar Histórico
        </Button>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="compare">Comparar Versões</TabsTrigger>
          <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
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
                          onClick={() => handlePreviewVersion(version)}
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
        </TabsContent>

        <TabsContent value="compare">
          <div className="text-center py-8">
            <GitBranch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comparar Versões</h3>
            <p className="text-gray-600 mb-4">
              Selecione duas versões para ver as diferenças lado a lado
            </p>
            <Button variant="outline">Selecionar Versões</Button>
          </div>
        </TabsContent>

        <TabsContent value="drafts">
          <div className="space-y-4">
            {versions.filter(v => !v.isPublished).map(version => (
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
        </TabsContent>
      </Tabs>

      {/* Modal de preview */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Preview - Versão {selectedVersion.version}
                </h2>
                <Button variant="ghost" onClick={() => setSelectedVersion(null)}>
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose max-w-none">
                <h3>{selectedVersion.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: selectedVersion.content }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
