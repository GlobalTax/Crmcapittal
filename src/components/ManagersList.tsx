
import { useManagers } from '@/hooks/useManagers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManagerPhotoUpload } from './ManagerPhotoUpload';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Briefcase, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { RevealSection } from '@/components/ui/RevealSection';

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
      {/* Stats Cards (toggle) */}
      <RevealSection storageKey="managers/stats" defaultCollapsed={false} collapsedLabel="Mostrar tarjetas" expandedLabel="Ocultar tarjetas" count={3}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-4 border border-border hover:bg-accent transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Gestores</p>
                <p className="text-2xl font-bold text-foreground">{totalManagers}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card p-4 border border-border hover:bg-accent transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gestores Activos</p>
                <p className="text-2xl font-bold text-foreground">{activeManagers}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="bg-card p-4 border border-border hover:bg-accent transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Departamentos</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.from(new Set(managers.map(m => m.position).filter(Boolean))).length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Equipo de Gestores</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Gestor
        </Button>
      </div>

      {/* Managers Grid */}
      {managers.length === 0 ? (
        <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center">
          <h3 className="text-sm font-medium text-foreground mb-2">No hay gestores registrados</h3>
          <p className="text-muted-foreground mb-4">Añade tu primer gestor al equipo</p>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Primer Gestor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {managers.map((manager) => (
            <Card key={manager.id} className="hover:bg-accent transition-colors duration-200 border-border bg-card">
              <CardHeader className="text-center pb-4">
                <ManagerPhotoUpload
                  managerId={manager.id}
                  managerName={manager.name}
                  currentPhoto={manager.photo}
                />
                <CardTitle className="text-sm text-foreground">{manager.name}</CardTitle>
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
                  <span className="truncate text-foreground">{manager.email}</span>
                </div>
                
                {manager.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-foreground">{manager.phone}</span>
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
