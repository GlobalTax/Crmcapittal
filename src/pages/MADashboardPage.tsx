
import React from 'react';
import { MADashboard } from '@/components/analytics/MADashboard';

const MADashboardPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard M&A
          </h1>
          <p className="text-gray-600">
            Analytics especializados para fusiones y adquisiciones
          </p>
        </div>
        
        <MADashboard />
      </div>
    </div>
  );
};

export default MADashboardPage;
