
import React from 'react';
import { MAReportsView } from '@/components/analytics/MAReportsView';

const Reports = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-2">
          Genera reportes personalizados y análisis detallados
        </p>
      </div>
      <MAReportsView />
    </div>
  );
};

export default Reports;
