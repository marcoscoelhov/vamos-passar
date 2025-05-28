
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Topic } from '@/types/course';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface TopicHeaderProps {
  currentTopic: Topic;
  topicIsBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const TopicHeader = React.memo(function TopicHeader({
  currentTopic,
  topicIsBookmarked,
  onToggleBookmark
}: TopicHeaderProps) {
  return (
    <>
      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* Cabeçalho do tópico */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentTopic.title}
              </h1>
              
              {/* Botão de marcador */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleBookmark}
                className="text-gray-400 hover:text-yellow-500"
              >
                {topicIsBookmarked ? (
                  <BookmarkCheck className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
              </Button>
              
              {currentTopic.completed && (
                <Badge className="bg-green-100 text-green-800">
                  Concluído
                </Badge>
              )}
            </div>
            {currentTopic.level > 0 && (
              <div className="text-sm text-gray-500">
                Subtópico • Nível {currentTopic.level}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
