
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import UserProjectsList from "@/components/UserProjectsList";

const Projects = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y operaciones favoritas.
          </p>
        </div>
        
        <UserProjectsList />
      </div>
    </DashboardLayout>
  );
};

export default Projects;
