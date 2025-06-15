
import React from 'react';
import { ModernEditor } from '@/components/editor/ModernEditor';
import { Question } from '@/types/course';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showValidation?: boolean;
  onQuestionInsert?: (question: Omit<Question, 'id'>, position: number) => void;
}

export function EnhancedRichTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  className,
  showValidation = true,
  onQuestionInsert
}: EnhancedRichTextEditorProps) {
  return (
    <div className={className}>
      <ModernEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Digite '/' para comandos ou comece a escrever..."}
        onQuestionInsert={onQuestionInsert}
        autoSave={true}
        showWordCount={true}
      />
      
      {showValidation && (
        <div className="mt-3 text-xs text-gray-500">
          💡 <strong>Dicas:</strong> Use "/" para comandos rápidos, selecione texto para formatação, ou use Ctrl+B/I para negrito/itálico
        </div>
      )}
    </div>
  );
}
