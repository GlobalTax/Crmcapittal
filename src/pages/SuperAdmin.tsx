
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import UserManagement from "@/components/UserManagement";

const SuperAdmin = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Super Administración</h2>
          <p className="text-muted-foreground">
            Panel de control avanzado para la gestión completa del sistema.
          </p>
        </div>
        
        <UserManagement />
      </div>
    </DashboardLayout>
  );
};

export default SuperAdmin;
