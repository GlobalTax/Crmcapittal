export default function MinimalCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
        <p className="text-gray-600 mt-1">Gestiona tus citas y eventos</p>
      </div>
      
      <div className="bg-white rounded-lg border p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendario de Eventos</h3>
          <p className="text-gray-600 mb-4">
            Esta funcionalidad estará disponible próximamente.
          </p>
          <div className="text-sm text-gray-500">
            Mientras tanto, puedes usar el sistema de tareas en Time Tracking para organizar tu agenda.
          </div>
        </div>
      </div>
    </div>
  );
}