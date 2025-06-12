
interface OperationsEmptyStateProps {
  loading?: boolean;
  error?: string | null;
  hasOperations: boolean;
}

export const OperationsEmptyState = ({ loading, error, hasOperations }: OperationsEmptyStateProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-black p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-black mb-2">Cargando operaciones...</h3>
          <p className="text-black">Por favor espera mientras cargamos las operaciones disponibles.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-black p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-black mb-2">Error al cargar operaciones</h3>
          <p className="text-black">{error}</p>
        </div>
      </div>
    );
  }

  if (!hasOperations) {
    return (
      <div className="bg-white rounded-xl shadow-sm border-black p-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-black mb-2">No hay operaciones disponibles</h3>
          <p className="text-black">Actualmente no hay operaciones disponibles en nuestra cartera.</p>
        </div>
      </div>
    );
  }

  return null;
};
