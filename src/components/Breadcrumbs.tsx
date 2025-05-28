
import React, { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCourse } from '@/contexts/CourseContext';
import { Topic } from '@/types/course';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  id: string;
  title: string;
  topic?: Topic;
  isLast: boolean;
}

export const Breadcrumbs = React.memo(function Breadcrumbs() {
  const { currentCourse, currentTopic, setCurrentTopic } = useCourse();

  const breadcrumbItems = useMemo(() => {
    if (!currentCourse || !currentTopic) return [];

    const items: BreadcrumbItem[] = [];
    
    // Add course as root
    items.push({
      id: 'course',
      title: currentCourse.title,
      isLast: false,
    });

    // Build topic hierarchy path
    const buildPath = (topic: Topic, allTopics: Topic[]): Topic[] => {
      const path: Topic[] = [];
      
      // Find parent topic
      const findParent = (topics: Topic[], targetId: string): Topic | null => {
        for (const t of topics) {
          if (t.children?.some(child => child.id === targetId)) {
            return t;
          }
          if (t.children) {
            const found = findParent(t.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      let current = topic;
      while (current.level > 0) {
        path.unshift(current);
        const parent = findParent(allTopics, current.id);
        if (!parent) break;
        current = parent;
      }
      
      if (current.level === 0) {
        path.unshift(current);
      }

      return path;
    };

    const topicPath = buildPath(currentTopic, currentCourse.topics);
    
    topicPath.forEach((topic, index) => {
      items.push({
        id: topic.id,
        title: topic.title,
        topic,
        isLast: index === topicPath.length - 1,
      });
    });

    return items;
  }, [currentCourse, currentTopic]);

  const handleBreadcrumbClick = async (item: BreadcrumbItem) => {
    if (item.topic && item.topic.id !== currentTopic?.id) {
      await setCurrentTopic(item.topic);
    }
  };

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 mb-4">
      <Home className="w-4 h-4" />
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          
          {item.topic ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto p-1 text-sm font-normal",
                item.isLast 
                  ? "text-gray-900 font-medium cursor-default" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => !item.isLast && handleBreadcrumbClick(item)}
              disabled={item.isLast}
            >
              {item.title}
            </Button>
          ) : (
            <span className="text-gray-600 px-1">
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
});
