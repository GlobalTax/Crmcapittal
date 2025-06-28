
import React from 'react';
import { OperationsList } from '@/components/OperationsList';

const Deals = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Deals</h1>
        <p className="text-gray-600 mt-2">
          Administra todas las operaciones de M&A de tu cartera
        </p>
      </div>
      <OperationsList />
    </div>
  );
};

export default Deals;
