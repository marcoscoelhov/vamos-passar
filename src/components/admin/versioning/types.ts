
export interface ContentVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  changes: string[];
  isPublished: boolean;
  isCurrent: boolean;
}

export interface ContentVersioningProps {
  topicId: string;
  currentContent: string;
  onRestoreVersion: (version: ContentVersion) => void;
}
