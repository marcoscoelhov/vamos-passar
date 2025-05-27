
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, Eye } from 'lucide-react';

interface SuggestedTopic {
  title: string;
  content: string;
  level: number;
}

interface TopicSuggestionsProps {
  suggestions: SuggestedTopic[];
  onCreateTopic: (topic: SuggestedTopic) => void;
  onPreviewTopic: (topic: SuggestedTopic) => void;
}

export function TopicSuggestions({ suggestions, onCreateTopic, onPreviewTopic }: TopicSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[level] || colors[0];
  };

  const getLevelLabel = (level: number) => {
    const labels = ['Principal', 'Subtópico', 'Seção', 'Subseção', 'Item', 'Subitem'];
    return labels[level] || `Nível ${level + 1}`;
  };

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Tópicos Sugeridos</h3>
        <Badge variant="outline">{suggestions.length} sugestões</Badge>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Baseado na estrutura do documento, identificamos os seguintes tópicos. 
        Clique em "Criar Tópico" para adicionar diretamente ao curso.
      </p>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                  <Badge className={getLevelColor(suggestion.level)} variant="secondary">
                    {getLevelLabel(suggestion.level)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {suggestion.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPreviewTopic(suggestion)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={() => onCreateTopic(suggestion)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Criar Tópico
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Os tópicos são organizados hierarquicamente baseados nos cabeçalhos do documento. 
          Você pode ajustar a hierarquia após a criação.
        </p>
      </div>
    </Card>
  );
}
