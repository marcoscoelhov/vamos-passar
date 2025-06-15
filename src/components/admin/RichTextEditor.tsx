
import React from 'react';
import { ModernEditor } from '@/components/editor/ModernEditor';

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
  return (
    <div className={className}>
      <ModernEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Digite '/' para comandos ou comece a escrever..."}
        autoSave={true}
        showWordCount={showValidation}
      />
    </div>
  );
}
