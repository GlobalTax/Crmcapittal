
import { ManagersList } from "@/components/ManagersList";

const Managers = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestión de Managers</h2>
        <p className="text-muted-foreground">
          Administra los managers del sistema y sus perfiles.
        </p>
      </div>
      
      <ManagersList />
    </div>
  );
};

export default Managers;
