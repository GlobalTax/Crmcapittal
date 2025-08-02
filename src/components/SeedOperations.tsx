
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOperationsContext } from '@/contexts';
import { useToast } from "@/hooks/use-toast";
import { sampleOperationsData } from "@/utils/sampleOperationsData";

export const SeedOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createOperation } = useOperationsContext();
  const { toast } = useToast();

  const handleSeedOperations = async () => {
    setIsLoading(true);
    try {
      // Create operations one by one for now
      for (const operationData of sampleOperationsData) {
        await createOperation(operationData);
      }
      
      toast({
        title: "Operaciones creadas",
        description: `Se han creado ${sampleOperationsData.length} operaciones de ejemplo correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al crear las operaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSeedOperations}
      disabled={isLoading}
      variant="outline"
      className="border-black text-black hover:bg-gray-100"
    >
      {isLoading ? "Creando operaciones..." : "Crear 20 Operaciones de Ejemplo"}
    </Button>
  );
};
