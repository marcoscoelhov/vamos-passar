
import React, { Suspense } from 'react';
import { Header } from '@/components/Header';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { logger } from '@/utils/logger';

// Lazy load the AdminPanel component
const AdminPanel = React.lazy(() => 
  import('@/components/AdminPanel').then(module => {
    logger.debug('AdminPanel component loaded');
    return { default: module.AdminPanel };
  }).catch(error => {
    logger.error('Error loading AdminPanel component', error);
    throw error;
  })
);

const Admin = () => {
  logger.debug('Admin page rendering');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense 
        fallback={
          <div className="p-6">
            <LoadingSkeleton variant="card" className="w-full h-96" />
          </div>
        }
      >
        <AdminPanel />
      </Suspense>
    </div>
  );
};

export default Admin;
