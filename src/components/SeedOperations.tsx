
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOperations } from "@/hooks/useOperations";
import { useToast } from "@/hooks/use-toast";
import { sampleOperationsData } from "@/utils/sampleOperationsData";

export const SeedOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addBulkOperations } = useOperations();
  const { toast } = useToast();

  const handleSeedOperations = async () => {
    setIsLoading(true);
    try {
      const result = await addBulkOperations(sampleOperationsData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Operaciones creadas",
          description: `Se han creado ${sampleOperationsData.length} operaciones de ejemplo correctamente`,
        });
      }
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
