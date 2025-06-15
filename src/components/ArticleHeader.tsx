
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Topic } from '@/types/course';
import { Clock, CheckCircle2 } from 'lucide-react';

interface ArticleHeaderProps {
  topic: Topic;
}

export function ArticleHeader({ topic }: ArticleHeaderProps) {
  // Estimate reading time (average 200 words per minute)
  const wordCount = topic.content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <header className="mb-16">
      <div className="space-y-6">
        {/* Topic metadata */}
        <div className="flex items-center gap-4 text-sm text-gray-600 font-ui">
          {topic.level > 0 && (
            <span>Subtópico • Nível {topic.level}</span>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min de leitura</span>
          </div>
          {topic.completed && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluído</span>
            </div>
          )}
        </div>

        {/* Main title */}
        <h1 className="medium-title text-balance">
          {topic.title}
        </h1>

        {/* Divider */}
        <div className="w-16 h-px bg-gray-200"></div>
      </div>
    </header>
  );
}
