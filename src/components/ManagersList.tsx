
import { useManagers } from '@/hooks/useManagers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManagerPhotoUpload } from './ManagerPhotoUpload';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, Plus, Users } from 'lucide-react';
import { useState } from 'react';

export const ManagersList = () => {
  const { managers, loading, error } = useManagers();
  const [showAddForm, setShowAddForm] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Cargando gestores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  const totalManagers = managers.length;
  const activeManagers = managers.filter(manager => manager.email).length;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Gestores</p>
              <p className="text-sm font-bold text-black">{totalManagers}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Gestores Activos</p>
              <p className="text-sm font-bold text-black">{activeManagers}</p>
            </div>
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-white p-4 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Departamentos</p>
              <p className="text-sm font-bold text-black">
                {Array.from(new Set(managers.map(m => m.position).filter(Boolean))).length}
              </p>
            </div>
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-black">Equipo de Gestores</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Gestor
        </Button>
      </div>

      {/* Managers Grid */}
      {managers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border-black p-12 text-center">
          <h3 className="text-sm font-medium text-black mb-2">No hay gestores registrados</h3>
          <p className="text-muted-foreground mb-4">Añade tu primer gestor al equipo</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Primer Gestor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager) => (
            <Card key={manager.id} className="hover:shadow-lg transition-all duration-200 border-black bg-white">
              <CardHeader className="text-center pb-4">
                <ManagerPhotoUpload
                  managerId={manager.id}
                  managerName={manager.name}
                  currentPhoto={manager.photo}
                />
                <CardTitle className="text-sm text-black">{manager.name}</CardTitle>
                {manager.position && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {manager.position}
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="truncate text-black">{manager.email}</span>
                </div>
                
                {manager.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-black">{manager.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
