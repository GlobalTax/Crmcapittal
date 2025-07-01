
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminPanel = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración del sistema
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta funcionalidad estará disponible próximamente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
