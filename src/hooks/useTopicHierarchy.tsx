
import { useTopicOperations } from './useTopicOperations';
import { useTopicHierarchyOperations } from './useTopicHierarchyOperations';

export function useTopicHierarchy() {
  const {
    isLoading: operationsLoading,
    updateTopicTitle,
    deleteTopic,
    updateTopicContent,
  } = useTopicOperations();

  const {
    isLoading: hierarchyLoading,
    moveTopicToParent,
    reorderTopics,
    duplicateTopic,
  } = useTopicHierarchyOperations();

  const isLoading = operationsLoading || hierarchyLoading;

  return {
    isLoading,
    updateTopicTitle,
    deleteTopic,
    moveTopicToParent,
    reorderTopics,
    duplicateTopic,
    updateTopicContent,
  };
}
