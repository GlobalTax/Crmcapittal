import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { useDocuments } from '@/hooks/useDocuments';

const NewDocument = () => {
  return <DocumentEditor />;
};

const EditDocument = () => {
  const { documents, templates } = useDocuments();
  
  return (
    <Routes>
      <Route path=":id" element={<DocumentEditor />} />
    </Routes>
  );
};

const Documents = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Routes>
        <Route index element={<DocumentsList />} />
        <Route path="new" element={<NewDocument />} />
        <Route path=":id" element={<EditDocument />} />
      </Routes>
    </div>
  );
};

export default Documents;