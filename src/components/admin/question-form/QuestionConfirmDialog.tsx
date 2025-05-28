
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface QuestionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  question: string;
  options: string[];
  correctAnswer: number | null;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function QuestionConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  question,
  options,
  correctAnswer,
  explanation,
  difficulty
}: QuestionConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar adição de questão</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              <p className="mb-4">Você está prestes a adicionar uma nova questão. Revise os dados:</p>
              
              <div className="space-y-3 p-4 bg-gray-50 rounded max-h-60 overflow-y-auto">
                <div>
                  <p className="text-sm font-medium">Pergunta:</p>
                  <p className="text-sm">{question}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Opções:</p>
                  <ul className="text-sm space-y-1">
                    {options.map((option, index) => (
                      <li key={index} className={correctAnswer === index ? 'font-bold text-green-600' : ''}>
                        {String.fromCharCode(65 + index)}) {option}
                        {correctAnswer === index && ' ✓'}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Explicação:</p>
                  <p className="text-sm">{explanation}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Dificuldade:</p>
                  <p className="text-sm">{difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}</p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              'Confirmar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
