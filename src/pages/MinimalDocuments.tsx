import { Routes, Route } from 'react-router-dom';
import { Button } from "@/components/ui/minimal/Button";
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { useDocuments } from '@/hooks/useDocuments';

const NewDocument = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Documentos</h1>
        </div>
      </div>
      <DocumentEditor />
    </div>
  );
};

const EditDocument = () => {
  const { documents, templates } = useDocuments();
  
  return (
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Documentos</h1>
      </div>
      <Routes>
        <Route path=":id" element={<DocumentEditor />} />
      </Routes>
    </div>
  );
};

export default function MinimalDocuments() {
  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<DocumentsList />} />
        <Route path="new" element={<NewDocument />} />
        <Route path=":id" element={<EditDocument />} />
      </Routes>
    </div>
  );
}