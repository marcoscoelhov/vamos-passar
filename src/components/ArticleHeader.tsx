
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
    <header className="mb-12 lg:mb-20">
      <div className="space-y-6 lg:space-y-8">
        {/* Topic metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm lg:text-base text-gray-600 font-ui">
          {topic.level > 0 && (
            <span className="bg-gray-100 px-3 py-1 rounded-full">Subtópico • Nível {topic.level}</span>
          )}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min de leitura</span>
          </div>
          {topic.completed && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Concluído</span>
            </div>
          )}
        </div>

        {/* Main title */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-display text-gray-900 leading-tight text-balance">
          {topic.title}
        </h1>

        {/* Divider */}
        <div className="w-20 lg:w-24 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
      </div>
    </header>
  );
}
