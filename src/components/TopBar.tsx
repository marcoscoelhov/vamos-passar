
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, HelpCircle, Bookmark, BookmarkCheck, Key } from 'lucide-react';
import { Topic } from '@/types/course';
import { GlobalSearch } from './GlobalSearch';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { AnswerKeyModal } from './AnswerKeyModal';

interface TopBarProps {
  currentTopic: Topic;
  isDownloading: boolean;
  topicIsBookmarked: boolean;
  onDownloadTopicPDF: () => void;
  onScrollToQuestions: () => void;
  onToggleBookmark: () => void;
}

export function TopBar({
  currentTopic,
  isDownloading,
  topicIsBookmarked,
  onDownloadTopicPDF,
  onScrollToQuestions,
  onToggleBookmark,
}: TopBarProps) {
  return (
    <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlobalSearch />
            <KeyboardShortcuts />
          </div>
          
          <div className="flex items-center gap-2">
            {currentTopic.questions && currentTopic.questions.length > 0 && (
              <Button
                onClick={onScrollToQuestions}
                variant="ghost"
                size="sm"
                className="btn-minimal text-xs font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
                Questões
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadTopicPDF}
              disabled={isDownloading}
              className="btn-minimal text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {isDownloading ? 'Baixando...' : 'PDF'}
            </Button>

            {currentTopic.questions && currentTopic.questions.length > 0 && (
              <AnswerKeyModal topic={currentTopic}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="btn-minimal text-xs font-medium"
                >
                  <Key className="w-3.5 h-3.5 mr-1.5" />
                  Gabarito
                </Button>
              </AnswerKeyModal>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              className="btn-minimal p-2"
            >
              {topicIsBookmarked ? (
                <BookmarkCheck className="w-4 h-4 text-amber-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
