/**
 * Company Card Component
 */

import React from 'react';
import { Company } from '../types';

interface CompanyCardProps {
  company: Company;
  onView?: (company: Company) => void;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ 
  company, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="border border-gray-200 bg-white p-4 space-y-4 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-black text-base">{company.name}</h3>
          {company.sector && (
            <p className="text-black text-xs">{company.sector}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {company.city && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Ciudad:</span>
            <span className="text-sm">{company.city}</span>
          </div>
        )}
        
        {company.website && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Web:</span>
            <span className="text-sm">{company.website}</span>
          </div>
        )}
      </div>
      
      {(onView || onEdit || onDelete) && (
        <div className="flex gap-2 pt-2">
          {onView && (
            <button 
              onClick={() => onView(company)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              Ver
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(company)}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(company)}
              className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
};