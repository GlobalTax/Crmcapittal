
import React from 'react';
import { MASearchView } from '@/components/analytics/MASearchView';

const SearchPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Búsqueda Inteligente</h1>
        <p className="text-gray-600 mt-2">
          Encuentra oportunidades específicas con filtros avanzados
        </p>
      </div>
      <MASearchView />
    </div>
  );
};

export default SearchPage;
