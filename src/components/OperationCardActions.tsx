
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Operation } from "@/types/Operation";
import { getOperationTypeLabel } from "@/utils/operationHelpers";
import { UserDataModal } from "./UserDataModal";
import { Mail, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OperationCardActionsProps {
  operation: Operation;
}

interface UserData {
  name: string;
  email: string;
  company: string;
  phone?: string;
  message?: string;
}

export const OperationCardActions = ({ operation }: OperationCardActionsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"info" | "teaser">("info");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRequestInfo = () => {
    setActionType("info");
    setIsModalOpen(true);
  };

  const handleDownloadTeaser = () => {
    setActionType("teaser");
    setIsModalOpen(true);
  };

  const handleUserDataSubmit = async (userData: UserData) => {
    setIsLoading(true);
    
    try {
      if (actionType === "info") {
        await handleInfoRequest(userData);
      } else {
        await handleTeaserDownload(userData);
      }
      
      setIsModalOpen(false);
      toast({
        title: actionType === "info" ? "Solicitud enviada" : "Descarga iniciada",
        description: actionType === "info" 
          ? "Hemos enviado tu solicitud de información. Te contactaremos pronto."
          : "El teaser se descargará automáticamente en breve.",
      });
      
    } catch (error) {
      console.error("Error processing request:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInfoRequest = async (userData: UserData) => {
    // Crear el contenido del email
    const subject = `Solicitud de información - ${operation.company_name}`;
    const bodyContent = `
Solicitud de información:

Datos del solicitante:
- Nombre: ${userData.name}
- Empresa: ${userData.company}
- Email: ${userData.email}
- Teléfono: ${userData.phone || 'No proporcionado'}

Operación de interés:
- Empresa: ${operation.company_name}
- Tipo: ${getOperationTypeLabel(operation.operation_type)}
- Sector: ${operation.sector}
- Ubicación: ${operation.location}

Mensaje adicional:
${userData.message || 'Ningún mensaje adicional'}
    `.trim();

    // Determinar el email de destino
    const recipientEmail = operation.manager?.email || operation.contact_email;
    
    if (recipientEmail) {
      // Abrir cliente de email
      const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
      window.location.href = mailtoUrl;
    } else {
      // Si no hay email, mostrar la información de contacto disponible
      const contactInfo = operation.contact_phone || operation.manager?.phone;
      if (contactInfo) {
        alert(`Para más información sobre ${operation.company_name}, contacte por teléfono: ${contactInfo}`);
      } else {
        alert(`Información de contacto no disponible para ${operation.company_name}`);
      }
    }

    // Aquí podrías también enviar los datos a tu backend para tracking
    console.log('Info request data:', { userData, operation: operation.id });
  };

  const handleTeaserDownload = async (userData: UserData) => {
    // Simular descarga de teaser (aquí implementarías la lógica real)
    console.log('Teaser download data:', { userData, operation: operation.id });
    
    // Simulación de descarga
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí implementarías la descarga real del archivo
    // Por ejemplo, hacer una llamada a tu API para generar/obtener el teaser
    // y luego descargar el archivo
    
    // Ejemplo de descarga simulada:
    const blob = new Blob([`Teaser de ${operation.company_name}`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${operation.company_name}_teaser.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="pt-3 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={handleRequestInfo}
            className="w-full"
            variant="default"
            size="sm"
          >
            <Mail className="h-3 w-3 mr-1" />
            Solicitar Info
          </Button>
          
          <Button 
            onClick={handleDownloadTeaser}
            className="w-full"
            variant="outline"
            size="sm"
          >
            <Download className="h-3 w-3 mr-1" />
            Descargar Teaser
          </Button>
        </div>
      </div>

      <UserDataModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        operation={operation}
        actionType={actionType}
        onSubmit={handleUserDataSubmit}
        isLoading={isLoading}
      />
    </>
  );
};
