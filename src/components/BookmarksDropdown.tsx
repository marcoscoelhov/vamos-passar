
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useCourse } from '@/contexts/CourseContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import { logger } from '@/utils/logger';

export const BookmarksDropdown = React.memo(function BookmarksDropdown() {
  const { user, setCurrentTopic } = useCourse();
  const { bookmarks } = useBookmarks(user?.id);
  const [open, setOpen] = useState(false);

  const handleBookmarkClick = async (topicId: string) => {
    // Find the topic and navigate to it
    // This is a simplified version - in a real app you might need to search through the course structure
    logger.debug('Navigate to topic', { topicId });
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {bookmarks.length > 0 ? (
            <BookmarkCheck className="w-4 h-4 text-yellow-500" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Marcadores</span>
          {bookmarks.length > 0 && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full">
              {bookmarks.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Seus Marcadores</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {bookmarks.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            Nenhum marcador salvo ainda.
            <br />
            Clique no ícone de marcador nos tópicos para salvá-los.
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <DropdownMenuItem
              key={bookmark.id}
              onClick={() => handleBookmarkClick(bookmark.topicId)}
              className="flex items-start gap-2 p-3"
            >
              <Bookmark className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {bookmark.topicTitle}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(bookmark.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
