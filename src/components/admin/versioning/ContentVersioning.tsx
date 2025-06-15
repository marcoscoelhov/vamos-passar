
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Download } from 'lucide-react';
import { VersionTimeline } from './VersionTimeline';
import { VersionCompare } from './VersionCompare';
import { DraftManagement } from './DraftManagement';
import { VersionPreviewModal } from './VersionPreviewModal';
import { ContentVersion, ContentVersioningProps } from './types';

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

  const handleClosePreview = () => {
    setSelectedVersion(null);
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
          <VersionTimeline 
            versions={versions}
            onPreviewVersion={handlePreviewVersion}
            onRestoreVersion={onRestoreVersion}
          />
        </TabsContent>

        <TabsContent value="compare">
          <VersionCompare />
        </TabsContent>

        <TabsContent value="drafts">
          <DraftManagement versions={versions} />
        </TabsContent>
      </Tabs>

      <VersionPreviewModal 
        version={selectedVersion}
        onClose={handleClosePreview}
      />
    </div>
  );
}
