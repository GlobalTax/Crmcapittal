/**
 * Contact Card Component
 */

import React from 'react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onView?: (contact: Contact) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ 
  contact, 
  onView, 
  onEdit, 
  onDelete 
}) => {
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
              onClick={() => onView(contact)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              Ver
            </button>
          )}
          {onEdit && (
            <button 
              onClick={() => onEdit(contact)}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(contact)}
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