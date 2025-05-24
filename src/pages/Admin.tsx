
import React from 'react';
import { AdminPanel } from '@/components/AdminPanel';
import { Header } from '@/components/Header';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AdminPanel />
    </div>
  );
};

export default Admin;
