
import ProjectsList from "@/components/ProjectsList";

const Projects = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
        <p className="text-muted-foreground">
          Gestiona tus proyectos y operaciones favoritas.
        </p>
      </div>
      
      <ProjectsList />
    </div>
  );
};

export default Projects;
