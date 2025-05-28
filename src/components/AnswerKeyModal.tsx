import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Key } from 'lucide-react';
import { Topic } from '@/types/course';
import { generateAnswerKeyPDF } from '@/utils/answerKeyFormatter';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface AnswerKeyModalProps {
  topic: Topic;
  children: React.ReactNode;
}

export function AnswerKeyModal({ topic, children }: AnswerKeyModalProps) {
  const { toast } = useToast();

  const handleDownloadAnswerKey = () => {
    try {
      const pdf = generateAnswerKeyPDF(topic);
      const fileName = `gabarito_${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: 'Gabarito baixado',
        description: 'O gabarito foi baixado em PDF com sucesso.',
      });
    } catch (error) {
      logger.error('Error downloading answer key', { topicId: topic.id, error });
      toast({
        title: 'Erro no download',
        description: 'Não foi possível baixar o gabarito.',
        variant: 'destructive',
      });
    }
  };

  if (!topic.questions || topic.questions.length === 0) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Gabarito - {topic.title}
            </DialogTitle>
            <Button
              onClick={handleDownloadAnswerKey}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {topic.questions.map((question, index) => (
            <div key={question.id} className="border-b pb-4 last:border-b-0">
              <div className="mb-3">
                <h4 className="font-semibold text-sm text-gray-900 mb-2">
                  Questão {index + 1}
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  {question.question}
                </p>
              </div>
              
              <div className="space-y-2">
                {question.options.map((option, optIndex) => {
                  const isCorrect = optIndex === question.correctAnswer;
                  const letter = String.fromCharCode(65 + optIndex);
                  
                  return (
                    <div
                      key={optIndex}
                      className={`p-2 rounded text-sm ${
                        isCorrect
                          ? 'bg-green-100 border border-green-300 text-green-800 font-medium'
                          : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="font-medium">{letter})</span> {option}
                      {isCorrect && (
                        <span className="ml-2 text-xs bg-green-200 px-2 py-1 rounded">
                          ✓ Resposta Correta
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {question.explanation && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Explicação:</span> {question.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
