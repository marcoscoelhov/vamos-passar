
import React, { useMemo } from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useCourse } from '@/contexts/CourseContext';
import { Topic } from '@/types/course';
import { logger } from '@/utils/logger';

interface BreadcrumbData {
  id: string;
  title: string;
  topic?: Topic;
  isLast: boolean;
  url?: string;
}

export const Breadcrumbs = React.memo(function Breadcrumbs() {
  const { currentCourse, currentTopic, setCurrentTopic } = useCourse();

  const breadcrumbItems = useMemo(() => {
    if (!currentCourse || !currentTopic) {
      logger.debug('Breadcrumbs: Missing course or topic data', {
        hasCourse: !!currentCourse,
        hasTopic: !!currentTopic
      });
      return [];
    }

    const items: BreadcrumbData[] = [];
    
    // Add course as root
    items.push({
      id: 'course',
      title: currentCourse.title,
      isLast: false,
      url: '/',
    });

    // Build topic hierarchy path
    const buildPath = (topic: Topic, allTopics: Topic[]): Topic[] => {
      const path: Topic[] = [];
      
      // Find parent topic recursively
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

    try {
      const topicPath = buildPath(currentTopic, currentCourse.topics);
      
      topicPath.forEach((topic, index) => {
        items.push({
          id: topic.id,
          title: topic.title,
          topic,
          isLast: index === topicPath.length - 1,
        });
      });

      logger.debug('Breadcrumbs: Built path successfully', {
        courseTitle: currentCourse.title,
        topicPath: topicPath.map(t => t.title),
        totalItems: items.length
      });
    } catch (error) {
      logger.error('Breadcrumbs: Error building path', {
        error,
        courseId: currentCourse.id,
        topicId: currentTopic.id
      });
      return [items[0]]; // Return only course item on error
    }

    return items;
  }, [currentCourse, currentTopic]);

  const handleBreadcrumbClick = async (item: BreadcrumbData) => {
    if (item.topic && item.topic.id !== currentTopic?.id) {
      try {
        logger.debug('Breadcrumbs: Navigating to topic', {
          fromTopic: currentTopic?.id,
          toTopic: item.topic.id,
          topicTitle: item.topic.title
        });
        await setCurrentTopic(item.topic);
      } catch (error) {
        logger.error('Breadcrumbs: Error navigating to topic', {
          error,
          topicId: item.topic.id
        });
      }
    }
  };

  if (breadcrumbItems.length <= 1) {
    logger.debug('Breadcrumbs: Not enough items to display', {
      itemCount: breadcrumbItems.length
    });
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Home className="w-4 h-4" />
        </BreadcrumbItem>
        
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.id}>
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className="font-medium">
                  {item.title}
                </BreadcrumbPage>
              ) : item.url ? (
                <BreadcrumbLink asChild>
                  <Link to={item.url} className="hover:text-foreground">
                    {item.title}
                  </Link>
                </BreadcrumbLink>
              ) : item.topic ? (
                <BreadcrumbLink 
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleBreadcrumbClick(item)}
                >
                  {item.title}
                </BreadcrumbLink>
              ) : (
                <span className="text-muted-foreground">
                  {item.title}
                </span>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
});
