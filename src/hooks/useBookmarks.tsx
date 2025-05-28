
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface Bookmark {
  id: string;
  topicId: string;
  topicTitle: string;
  createdAt: string;
}

export function useBookmarks(userId?: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load bookmarks from localStorage (could be extended to use Supabase later)
  useEffect(() => {
    if (!userId) return;
    
    const loadBookmarks = () => {
      try {
        const stored = localStorage.getItem(`bookmarks_${userId}`);
        if (stored) {
          setBookmarks(JSON.parse(stored));
        }
      } catch (error) {
        logger.error('Error loading bookmarks', { userId, error });
      }
    };

    loadBookmarks();
  }, [userId]);

  const saveBookmarks = useCallback((newBookmarks: Bookmark[]) => {
    if (!userId) return;
    
    try {
      localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(newBookmarks));
      setBookmarks(newBookmarks);
    } catch (error) {
      logger.error('Error saving bookmarks', { userId, error });
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o marcador.',
        variant: 'destructive',
      });
    }
  }, [userId, toast]);

  const addBookmark = useCallback((topicId: string, topicTitle: string) => {
    if (!userId) return;

    const newBookmark: Bookmark = {
      id: `bookmark_${Date.now()}`,
      topicId,
      topicTitle,
      createdAt: new Date().toISOString(),
    };

    const updatedBookmarks = [...bookmarks, newBookmark];
    saveBookmarks(updatedBookmarks);

    toast({
      title: 'Marcador adicionado',
      description: `"${topicTitle}" foi adicionado aos seus marcadores.`,
    });
  }, [userId, bookmarks, saveBookmarks, toast]);

  const removeBookmark = useCallback((topicId: string) => {
    if (!userId) return;

    const bookmark = bookmarks.find(b => b.topicId === topicId);
    const updatedBookmarks = bookmarks.filter(b => b.topicId !== topicId);
    saveBookmarks(updatedBookmarks);

    if (bookmark) {
      toast({
        title: 'Marcador removido',
        description: `"${bookmark.topicTitle}" foi removido dos seus marcadores.`,
      });
    }
  }, [userId, bookmarks, saveBookmarks, toast]);

  const isBookmarked = useCallback((topicId: string): boolean => {
    return bookmarks.some(b => b.topicId === topicId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((topicId: string, topicTitle: string) => {
    if (isBookmarked(topicId)) {
      removeBookmark(topicId);
    } else {
      addBookmark(topicId, topicTitle);
    }
  }, [isBookmarked, removeBookmark, addBookmark]);

  const memoizedReturn = useMemo(() => ({
    bookmarks,
    isLoading,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  }), [bookmarks, isLoading, addBookmark, removeBookmark, isBookmarked, toggleBookmark]);

  return memoizedReturn;
}
