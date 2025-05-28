
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Topic } from '@/types/course';

interface ArticleHeaderProps {
  topic: Topic;
}

export function ArticleHeader({ topic }: ArticleHeaderProps) {
  return (
    <header className="mb-12 text-center">
      <h1 className="font-serif text-4xl font-semibold text-gray-900 mb-4 leading-tight">
        {topic.title}
      </h1>
      
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
        {topic.level > 0 && (
          <span>Subtópico • Nível {topic.level}</span>
        )}
        {topic.completed && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Concluído
          </Badge>
        )}
      </div>
    </header>
  );
}
