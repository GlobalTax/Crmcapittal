
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Calendar } from "lucide-react";

const ProjectsList = () => {
  // This is a placeholder for now - in a real app, you'd fetch projects from your backend
  const projects = [
    {
      id: 1,
      name: "Proyecto Alpha",
      description: "Desarrollo de plataforma de inversión",
      status: "active",
      created_at: "2024-01-15",
      operations_count: 5
    },
    {
      id: 2,
      name: "Proyecto Beta",
      description: "Expansión europea",
      status: "planning",
      created_at: "2024-02-01",
      operations_count: 3
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'planning':
        return 'Planificación';
      case 'completed':
        return 'Completado';
      default:
        return 'Desconocido';
    }
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Folder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
        <p className="text-gray-500 mb-6">
          Comienza creando tu primer proyecto para organizar tus operaciones.
        </p>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Proyecto
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Mis Proyectos</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona y organiza tus proyectos de inversión
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{project.name}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {project.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.created_at).toLocaleDateString('es-ES')}
                </div>
                <div className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  {project.operations_count} operaciones
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
