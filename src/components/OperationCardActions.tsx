
import { Button } from "@/components/ui/button";
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel } from "@/utils/operationHelpers";

interface OperationCardActionsProps {
  operation: Operation;
}

export const OperationCardActions = ({ operation }: OperationCardActionsProps) => {
  const handleRequestInfo = (operation: Operation) => {
    const subject = `Solicitud de información - ${operation.company_name}`;
    const body = `Hola,\n\nEstoy interesado en obtener más información sobre la operación de ${operation.company_name} (${getOperationTypeLabel(operation.operation_type)}) en el sector ${operation.sector}.\n\nGracias.`;
    
    if (operation.manager?.email) {
      window.location.href = `mailto:${operation.manager.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else if (operation.contact_email) {
      window.location.href = `mailto:${operation.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } else {
      alert(`Para más información sobre ${operation.company_name}, contacte por teléfono: ${operation.contact_phone || operation.manager?.phone || 'Información de contacto no disponible'}`);
    }
  };

  return (
    <div className="pt-3 border-t border-slate-100">
      <Button 
        onClick={() => handleRequestInfo(operation)}
        className="w-full"
        variant="default"
        size="sm"
      >
        Solicitar información
      </Button>
    </div>
  );
};
