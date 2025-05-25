
import React from 'react';
import { CourseLayout } from '@/components/CourseLayout';
import { CourseProvider } from '@/contexts/CourseContext';

const Index = () => {
  return (
    <CourseProvider>
      <CourseLayout />
    </CourseProvider>
  );
};

export default Index;
