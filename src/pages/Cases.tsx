
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCases } from "@/hooks/useCases";
import { CasesTable } from "@/components/cases/CasesTable";
import { CreateCaseDialog } from "@/components/cases/CreateCaseDialog";

const Cases = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { cases, isLoading, error, refetch } = useCases();

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Error al cargar expedientes: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todos los expedientes y casos legales
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Expediente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Expedientes</CardTitle>
          <CardDescription>
            {cases.length} expediente{cases.length !== 1 ? 's' : ''} encontrado{cases.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CasesTable cases={cases as any} loading={isLoading} onRefetch={refetch} />
        </CardContent>
      </Card>

      <CreateCaseDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCaseCreated={refetch}
      />
    </div>
  );
};

export default Cases;
