
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, BookOpen, FileText } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { Topic } from '@/types/course';
import { flattenTopicHierarchy } from '@/utils/dataMappers';

interface SearchResult {
  id: string;
  title: string;
  type: 'topic' | 'content';
  topic: Topic;
  preview?: string;
}

export const GlobalSearch = React.memo(function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const { currentCourse, setCurrentTopic } = useCourse();

  const searchResults = useMemo(() => {
    if (!currentCourse) return [];

    const flatTopics = flattenTopicHierarchy(currentCourse.topics);
    const results: SearchResult[] = [];

    flatTopics.forEach(topic => {
      // Add topic title as result
      results.push({
        id: `topic-${topic.id}`,
        title: topic.title,
        type: 'topic',
        topic,
      });

      // Add content snippets if they contain searchable text
      if (topic.content) {
        const contentPreview = topic.content
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .substring(0, 100);
        
        results.push({
          id: `content-${topic.id}`,
          title: `Conteúdo: ${topic.title}`,
          type: 'content',
          topic,
          preview: contentPreview,
        });
      }
    });

    return results;
  }, [currentCourse]);

  const handleSelect = useCallback(async (result: SearchResult) => {
    await setCurrentTopic(result.topic);
    setOpen(false);
  }, [setCurrentTopic]);

  // Keyboard shortcut to open search
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar tópicos e conteúdo..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Tópicos">
            {searchResults
              .filter(result => result.type === 'topic')
              .map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{result.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandGroup heading="Conteúdo">
            {searchResults
              .filter(result => result.type === 'content')
              .map((result) => (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex flex-col items-start gap-1"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{result.title}</span>
                  </div>
                  {result.preview && (
                    <span className="text-sm text-muted-foreground ml-6">
                      {result.preview}...
                    </span>
                  )}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
});
