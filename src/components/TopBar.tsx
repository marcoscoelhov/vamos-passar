
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, HelpCircle, Bookmark, BookmarkCheck, Key, Menu } from 'lucide-react';
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
  onOpenSidebar: () => void;
  isSidebarOpen: boolean;
}

export function TopBar({
  currentTopic,
  isDownloading,
  topicIsBookmarked,
  onDownloadTopicPDF,
  onScrollToQuestions,
  onToggleBookmark,
  onOpenSidebar,
  isSidebarOpen,
}: TopBarProps) {
  return (
    <div className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-content mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              onClick={onOpenSidebar}
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="hidden md:flex items-center gap-3">
              <GlobalSearch />
              <KeyboardShortcuts />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {currentTopic.questions && currentTopic.questions.length > 0 && (
              <Button
                onClick={onScrollToQuestions}
                variant="ghost"
                size="sm"
                className="btn-medium-ghost text-sm font-ui"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Questões</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onDownloadTopicPDF}
              disabled={isDownloading}
              className="btn-medium-ghost text-sm font-ui"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {isDownloading ? 'Baixando...' : 'PDF'}
              </span>
            </Button>

            {currentTopic.questions && currentTopic.questions.length > 0 && (
              <AnswerKeyModal topic={currentTopic}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="btn-medium-ghost text-sm font-ui"
                >
                  <Key className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Gabarito</span>
                </Button>
              </AnswerKeyModal>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleBookmark}
              className="btn-medium-ghost p-2"
            >
              {topicIsBookmarked ? (
                <BookmarkCheck className="w-5 h-5 text-green-600" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
