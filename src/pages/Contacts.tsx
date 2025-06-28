
import React from 'react';
import { ContactsList } from '@/components/contacts/ContactsList';

const Contacts = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Contactos</h1>
        <p className="text-gray-600 mt-2">
          Administra todos los contactos involucrados en operaciones de M&A
        </p>
      </div>
      <ContactsList />
    </div>
  );
};

export default Contacts;
