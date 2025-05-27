
import React, { useRef, useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-custom.css';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { validateHtmlContent, sanitizeHtmlContent } from '@/utils/contentSanitizer';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showValidation?: boolean;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  className,
  showValidation = true 
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [contentValidation, setContentValidation] = useState({ isValid: true, errors: [] });

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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
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
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ minHeight: '300px' }}
      />
      
      {showValidation && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
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
      )}
      
      {!contentValidation.isValid && contentValidation.errors.length > 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
          <p className="font-medium text-red-800 mb-1">Problemas encontrados:</p>
          <ul className="text-red-700 space-y-1">
            {contentValidation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
