
import React from 'react';
import { MADashboard } from '@/components/analytics/MADashboard';

const Analytics = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics M&A</h1>
        <p className="text-gray-600 mt-2">
          Análisis detallado y métricas de rendimiento
        </p>
      </div>
      <MADashboard />
    </div>
  );
};

export default Analytics;
