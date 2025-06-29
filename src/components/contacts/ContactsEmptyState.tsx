
import { User } from "lucide-react";

interface ContactsEmptyStateProps {
  searchTerm: string;
}

export const ContactsEmptyState = ({ searchTerm }: ContactsEmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No se encontraron contactos
      </h3>
      <p className="text-gray-500">
        {searchTerm ? 
          "Intenta con otros términos de búsqueda" : 
          "Crea tu primer contacto para comenzar"
        }
      </p>
    </div>
  );
};
