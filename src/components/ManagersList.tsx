
import { useManagers } from '@/hooks/useManagers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ManagerPhotoUpload } from './ManagerPhotoUpload';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, Plus } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestores de Operaciones</h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Añadir Gestor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {managers.map((manager) => (
          <Card key={manager.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <ManagerPhotoUpload
                managerId={manager.id}
                managerName={manager.name}
                currentPhoto={manager.photo}
              />
              <CardTitle className="text-lg">{manager.name}</CardTitle>
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
                <span className="truncate">{manager.email}</span>
              </div>
              
              {manager.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{manager.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {managers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No hay gestores registrados</div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Primer Gestor
          </Button>
        </div>
      )}
    </div>
  );
};
