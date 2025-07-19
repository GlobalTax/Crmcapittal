
import React from 'react';
import { Outlet } from 'react-router-dom';
import { ModernSidebar } from './ModernSidebar';
import { ModernHeader } from './ModernHeader';

export const ModernLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ModernSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ModernHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
