
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Pipeline = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Visualiza y gestiona tu pipeline de negocios
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Negocios</CardTitle>
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

export default Pipeline;
