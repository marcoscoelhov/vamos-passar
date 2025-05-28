
import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Download, HelpCircle, Key, AlertTriangle, RefreshCw } from 'lucide-react';
import { Topic } from '@/types/course';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { SectionErrorBoundary } from '@/components/SectionErrorBoundary';
import { logger } from '@/utils/logger';

// Lazy load components
const GlobalSearch = React.lazy(() => 
  import('@/components/GlobalSearch').then(module => {
    logger.debug('GlobalSearch component loaded');
    return { default: module.GlobalSearch };
  }).catch(error => {
    logger.error('Error loading GlobalSearch component', error);
    throw error;
  })
);

const KeyboardShortcuts = React.lazy(() => 
  import('@/components/KeyboardShortcuts').then(module => {
    logger.debug('KeyboardShortcuts component loaded');
    return { default: module.KeyboardShortcuts };
  }).catch(error => {
    logger.error('Error loading KeyboardShortcuts component', error);
    throw error;
  })
);

const AnswerKeyModal = React.lazy(() => 
  import('@/components/AnswerKeyModal').then(module => {
    logger.debug('AnswerKeyModal component loaded');
    return { default: module.AnswerKeyModal };
  }).catch(error => {
    logger.error('Error loading AnswerKeyModal component', error);
    throw error;
  })
);

interface CourseContentHeaderProps {
  currentTopic: Topic | null;
  isDownloading: boolean;
  onDownloadTopicPDF: () => void;
  onScrollToQuestions: () => void;
  error?: string | null;
  onRetry?: () => void;
}

export const CourseContentHeader = React.memo(function CourseContentHeader({
  currentTopic,
  isDownloading,
  onDownloadTopicPDF,
  onScrollToQuestions,
  error,
  onRetry
}: CourseContentHeaderProps) {
  const hasQuestions = currentTopic?.questions && currentTopic.questions.length > 0;

  if (error) {
    return (
      <div className="flex items-center justify-between mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  return (
    <SectionErrorBoundary sectionName="Cabeçalho do curso">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Suspense fallback={<LoadingSkeleton variant="button" className="w-64 h-8" />}>
            <GlobalSearch />
          </Suspense>
          <Suspense fallback={<LoadingSkeleton variant="button" className="w-32 h-8" />}>
            <KeyboardShortcuts />
          </Suspense>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão para questões */}
          {hasQuestions && (
            <Button
              onClick={onScrollToQuestions}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              Questões
            </Button>
          )}

          {/* Botão de download do tópico atual em PDF */}
          <Button
            variant="outline"
            size="sm"
            onClick={onDownloadTopicPDF}
            disabled={isDownloading || !currentTopic}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Baixando...' : 'PDF'}
          </Button>

          {/* Botão de gabarito */}
          {hasQuestions && currentTopic && (
            <Suspense fallback={<LoadingSkeleton variant="button" className="w-24 h-8" />}>
              <AnswerKeyModal topic={currentTopic}>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Gabarito
                </Button>
              </AnswerKeyModal>
            </Suspense>
          )}
        </div>
      </div>
    </SectionErrorBoundary>
  );
});
