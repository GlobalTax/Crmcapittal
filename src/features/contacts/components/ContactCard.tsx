/**
 * Contact Card Component
 */

import React, { useCallback } from 'react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

const ContactCardComponent: React.FC<ContactCardProps> = ({ 
  contact, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  const handleView = useCallback(() => {
    onView?.(contact);
  }, [onView, contact]);

  const handleEdit = useCallback(() => {
    onEdit?.(contact);
  }, [onEdit, contact]);

  const handleDelete = useCallback(() => {
    onDelete?.(contact);
  }, [onDelete, contact]);
  return (
    <div className="border border-gray-200 bg-white p-4 space-y-4 rounded-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-black text-base">
            {contact.name}
          </h3>
          {contact.position && (
            <p className="text-black text-xs">{contact.position}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {contact.email && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Email:</span>
            <span className="text-sm">{contact.email}</span>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Teléfono:</span>
            <span className="text-sm">{contact.phone}</span>
          </div>
        )}
      </div>
      
      {(onView || onEdit || onDelete) && (
        <div className="flex gap-2 pt-2">
          {onView && (
            <button 
              onClick={handleView}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              Ver
            </button>
          )}
          {onEdit && (
            <button 
              onClick={handleEdit}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button 
              onClick={handleDelete}
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

export const ContactCard = React.memo(ContactCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.contact.id === nextProps.contact.id &&
    prevProps.contact.name === nextProps.contact.name &&
    prevProps.contact.email === nextProps.contact.email &&
    prevProps.contact.phone === nextProps.contact.phone &&
    prevProps.contact.position === nextProps.contact.position &&
    prevProps.contact.updated_at === nextProps.contact.updated_at
  );
});