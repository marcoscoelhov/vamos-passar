
import React, { useRef, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Plus, AlertCircle, CheckCircle, FileText, Lightbulb } from 'lucide-react';
import { validateHtmlContent, sanitizeHtmlContent } from '@/utils/contentSanitizer';
import { InlineQuestionEditor } from './InlineQuestionEditor';
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
  const quillRef = useRef<ReactQuill>(null);
  const [contentValidation, setContentValidation] = useState({ isValid: true, errors: [] });
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [questionPosition, setQuestionPosition] = useState<number>(0);

  const handleChange = useCallback((content: string) => {
    // Validar conteúdo em tempo real
    if (showValidation) {
      const validation = validateHtmlContent(content);
      setContentValidation(validation);
    }
    
    onChange(content);
  }, [onChange, showValidation]);

  const handleSanitize = useCallback(() => {
    const sanitized = sanitizeHtmlContent(value);
    onChange(sanitized);
    
    // Re-validar após sanitização
    if (showValidation) {
      const validation = validateHtmlContent(sanitized);
      setContentValidation(validation);
    }
  }, [value, onChange, showValidation]);

  const handleInsertQuestion = useCallback(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection();
      const position = range ? range.index : value.length;
      setQuestionPosition(position);
      setShowQuestionEditor(true);
    }
  }, [value.length]);

  const handleQuestionSave = useCallback((question: Omit<Question, 'id'>) => {
    if (onQuestionInsert) {
      onQuestionInsert(question, questionPosition);
    }
    setShowQuestionEditor(false);
  }, [onQuestionInsert, questionPosition]);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean'],
        ['question-insert'] // Custom button
      ],
      handlers: {
        'question-insert': handleInsertQuestion
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'script', 'indent',
    'color', 'background', 'align',
    'blockquote', 'code-block', 'link'
  ];

  return (
    <div className={className}>
      {/* Helper Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-t-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <FileText className="w-4 h-4" />
            <span>Editor de Conteúdo</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleInsertQuestion}
            className="flex items-center gap-2 text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <HelpCircle className="w-4 h-4" />
            Inserir Questão
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Lightbulb className="w-3 h-3 mr-1" />
            Dica: Use Ctrl+Enter para inserir quebra
          </Badge>
        </div>
      </div>

      {/* Question Editor */}
      {showQuestionEditor && (
        <InlineQuestionEditor
          onInsert={handleQuestionSave}
          onCancel={() => setShowQuestionEditor(false)}
          position={questionPosition}
        />
      )}

      {/* Rich Text Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ 
          minHeight: '300px',
          borderTopLeftRadius: showQuestionEditor ? '0' : '0',
          borderTopRightRadius: showQuestionEditor ? '0' : '0'
        }}
      />
      
      {/* Validation and Status Bar */}
      {showValidation && (
        <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {contentValidation.isValid ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Conteúdo válido
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {contentValidation.errors.length} problema(s)
                </Badge>
              )}
              
              <div className="text-xs text-gray-500">
                {value.replace(/<[^>]*>/g, '').length} caracteres
              </div>
            </div>
            
            {!contentValidation.isValid && (
              <button
                onClick={handleSanitize}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
              >
                Corrigir automaticamente
              </button>
            )}
          </div>
          
          {!contentValidation.isValid && contentValidation.errors.length > 0 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
              <p className="font-medium text-red-800 mb-1">Problemas encontrados:</p>
              <ul className="text-red-700 space-y-1">
                {contentValidation.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
