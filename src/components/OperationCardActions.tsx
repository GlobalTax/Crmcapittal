
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Mail, Eye } from "lucide-react";
import { Operation } from "@/types/Operation";
import { FavoriteButton } from "./FavoriteButton";
import { UserDataModal } from "./UserDataModal";

interface OperationCardActionsProps {
  operation: Operation;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'minimal';
}

export const OperationCardActions = ({ operation, size = 'default', variant = 'default' }: OperationCardActionsProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulamos datos de analytics (en una implementación real vendrían de la base de datos)
  const views = Math.floor(Math.random() * 500) + 50;
  const downloads = Math.floor(Math.random() * 100) + 10;

  const handleTeaserDownload = () => {
    if (operation.teaser_url) {
      // Direct download for teaser - no form required
      window.open(operation.teaser_url, '_blank');
    } else {
      console.log("No teaser available for:", operation.company_name);
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
      setShowInfoModal(false);
    } catch (error) {
      console.error("Error submitting info request:", error);
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
            disabled={!operation.teaser_url}
            className="border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-1" />
            Teaser
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

        {/* Analytics justo debajo */}
        <div className="flex items-center justify-between text-xs text-black">
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
            disabled={!operation.teaser_url}
            className="border-black text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-2 h-4 w-4" />
            Teaser
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

      {/* Analytics justo debajo */}
      <div className="flex items-center justify-between text-xs text-black">
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
