
import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon, 
  Heading1, 
  Heading2, 
  Quote, 
  List, 
  ListOrdered,
  Code,
  Image as ImageIcon,
  HelpCircle,
  Save,
  Eye,
  Clock
} from 'lucide-react';
import { SlashCommandMenu } from './SlashCommandMenu';
import { QuestionInserter } from './QuestionInserter';
import { Question } from '@/types/course';

interface ModernEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onQuestionInsert?: (question: Omit<Question, 'id'>, position: number) => void;
  autoSave?: boolean;
  showWordCount?: boolean;
}

export function ModernEditor({ 
  value, 
  onChange, 
  placeholder = "Digite '/' para comandos ou comece a escrever...", 
  className,
  onQuestionInsert,
  autoSave = true,
  showWordCount = true
}: ModernEditorProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [showQuestionInserter, setShowQuestionInserter] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-700 cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Underline,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      // Update stats
      const stats = editor.storage.characterCount;
      setWordCount(stats.words());
      setReadingTime(Math.ceil(stats.words() / 200)); // ~200 words per minute
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !editor) return;

    const interval = setInterval(() => {
      setLastSaved(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, [autoSave, editor]);

  // Handle slash commands
  const handleSlashCommand = useCallback((command: string) => {
    if (!editor) return;

    const { from } = editor.state.selection;
    
    switch (command) {
      case 'h1':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).setHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).setHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).setHeading({ level: 3 }).run();
        break;
      case 'quote':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).setBlockquote().run();
        break;
      case 'bullet':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).toggleBulletList().run();
        break;
      case 'numbered':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).toggleOrderedList().run();
        break;
      case 'code':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).setCodeBlock().run();
        break;
      case 'question':
        editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
        setShowQuestionInserter(true);
        break;
    }
    
    setShowSlashMenu(false);
  }, [editor]);

  // Handle question insertion
  const handleQuestionInsert = useCallback((question: Omit<Question, 'id'>) => {
    if (!editor || !onQuestionInsert) return;
    
    const position = editor.state.selection.from;
    onQuestionInsert(question, position);
    setShowQuestionInserter(false);
  }, [editor, onQuestionInsert]);

  // Check for slash command trigger
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        const { from } = editor.state.selection;
        const textBefore = editor.state.doc.textBetween(Math.max(0, from - 1), from);
        
        if (textBefore === '' || textBefore === ' ') {
          setTimeout(() => setShowSlashMenu(true), 50);
        }
      } else if (event.key === 'Escape') {
        setShowSlashMenu(false);
        setShowQuestionInserter(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[400px] bg-gray-50 rounded-lg animate-pulse">
        <div className="p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Floating Bubble Menu */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
        <Card className="flex items-center gap-1 p-1 shadow-lg border">
          <Button
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <Button
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              const url = window.prompt('URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
        </Card>
      </BubbleMenu>

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <SlashCommandMenu
          onCommand={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
        />
      )}

      {/* Question Inserter */}
      {showQuestionInserter && (
        <QuestionInserter
          onInsert={handleQuestionInsert}
          onCancel={() => setShowQuestionInserter(false)}
        />
      )}

      {/* Main Editor */}
      <Card className="min-h-[400px] border-2 border-gray-200 focus-within:border-blue-300 transition-colors">
        <EditorContent editor={editor} />
      </Card>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {showWordCount && (
            <>
              <div className="flex items-center gap-1">
                <span>{wordCount} palavras</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{readingTime} min de leitura</span>
              </div>
            </>
          )}
          {autoSave && (
            <div className="flex items-center gap-1">
              <Save className="w-3 h-3" />
              <span>Salvo {lastSaved.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Digite "/" para comandos
          </Badge>
        </div>
      </div>
    </div>
  );
}
