
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Mail, Eye } from "lucide-react";
import { Operation } from "@/types/Operation";
import { FavoriteButton } from "./FavoriteButton";
import { UserDataModal } from "./UserDataModal";
import { toast } from "@/components/ui/sonner";

interface OperationCardActionsProps {
  operation: Operation;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'minimal';
}

// Función para generar datos consistentes basados en el ID de la operación
const generateConsistentAnalytics = (operationId: string) => {
  // Usar el ID como semilla para generar números consistentes
  let hash = 0;
  for (let i = 0; i < operationId.length; i++) {
    const char = operationId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Generar números pseudo-aleatorios pero consistentes
  const views = Math.abs(hash % 450) + 50; // Entre 50 y 500
  const downloads = Math.abs((hash * 7) % 90) + 10; // Entre 10 y 100
  
  return { views, downloads };
};

export const OperationCardActions = ({ operation, size = 'default', variant = 'default' }: OperationCardActionsProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Generar datos de analytics consistentes
  const { views, downloads } = generateConsistentAnalytics(operation.id);

  const handleTeaserDownload = async () => {
    if (!operation.teaser_url) {
      toast.error("No hay teaser disponible para esta operación");
      return;
    }

    setIsDownloading(true);
    
    try {
      // Crear un elemento <a> temporal para forzar la descarga
      const link = document.createElement('a');
      link.href = operation.teaser_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Intentar extraer el nombre del archivo del URL
      const urlParts = operation.teaser_url.split('/');
      const fileName = urlParts[urlParts.length - 1] || `teaser-${operation.company_name}.pdf`;
      link.download = fileName;
      
      // Añadir al DOM temporalmente y hacer click
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Descarga iniciada");
      
    } catch (error) {
      console.error("Error downloading teaser:", error);
      toast.error("Error al descargar el teaser. Inténtalo de nuevo.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleInfoRequest = () => {
    setShowInfoModal(true);
  };

  const handleInfoSubmit = async (userData: any) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement info request submission
      console.log("Info request submitted:", userData, "for operation:", operation.company_name);
      // Here you would typically send the request to your backend
      toast.success("Solicitud de información enviada correctamente");
      setShowInfoModal(false);
    } catch (error) {
      console.error("Error submitting info request:", error);
      toast.error("Error al enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (variant === 'minimal') {
    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FavoriteButton operationId={operation.id} size={size} />
          
          <Button 
            onClick={handleTeaserDownload}
            size={size} 
            variant="outline"
            disabled={!operation.teaser_url || isDownloading}
            className="border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloading ? "Descargando..." : "Teaser"}
          </Button>
          
          <Button 
            onClick={handleInfoRequest}
            size={size} 
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Mail className="h-4 w-4 mr-1" />
            Info
          </Button>
        </div>

        {/* Analytics en la misma línea */}
        <div className="flex items-center space-x-4 text-xs text-black">
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{views} vistas</span>
          </div>
          <div className="flex items-center space-x-1">
            <Download className="h-3 w-3" />
            <span>{downloads} descargas</span>
          </div>
        </div>

        <UserDataModal
          isOpen={showInfoModal}
          onClose={() => setShowInfoModal(false)}
          operation={operation}
          actionType="info"
          onSubmit={handleInfoSubmit}
          isLoading={isSubmitting}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <FavoriteButton operationId={operation.id} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleTeaserDownload}
            size="sm" 
            variant="outline"
            disabled={!operation.teaser_url || isDownloading}
            className="border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Descargando..." : "Teaser"}
          </Button>
          
          <Button 
            onClick={handleInfoRequest}
            size="sm" 
            className="bg-black hover:bg-gray-800 text-white"
          >
            Solicitar Info
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Analytics en la misma línea */}
      <div className="flex items-center space-x-4 text-xs text-black">
        <div className="flex items-center space-x-1">
          <Eye className="h-3 w-3" />
          <span>{views} vistas</span>
        </div>
        <div className="flex items-center space-x-1">
          <Download className="h-3 w-3" />
          <span>{downloads} descargas</span>
        </div>
      </div>

      <UserDataModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        operation={operation}
        actionType="info"
        onSubmit={handleInfoSubmit}
        isLoading={isSubmitting}
      />
    </div>
  );
};
