import { Routes, Route } from 'react-router-dom';
import { Button } from "@/components/ui/minimal/Button";
import { DocumentsList } from '@/components/documents/DocumentsList';
import { DocumentEditor } from '@/components/documents/DocumentEditor';
import { useDocuments } from '@/hooks/useDocuments';

const NewDocument = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Documento</h1>
          <p className="text-gray-600 mt-1">Crea un nuevo documento</p>
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Documento</h1>
          <p className="text-gray-600 mt-1">Modifica el documento seleccionado</p>
        </div>
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