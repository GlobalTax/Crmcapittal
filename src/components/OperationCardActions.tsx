
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Mail } from "lucide-react";
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
      <div className="flex items-center space-x-2">
        <FavoriteButton operationId={operation.id} size={size} />
        
        {operation.teaser_url && (
          <Button 
            onClick={handleTeaserDownload}
            size={size} 
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
          >
            <Download className="h-4 w-4 mr-1" />
            Teaser
          </Button>
        )}
        
        <Button 
          onClick={handleInfoRequest}
          size={size} 
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Mail className="h-4 w-4 mr-1" />
          Info
        </Button>

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
    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center space-x-2">
        <FavoriteButton operationId={operation.id} />
      </div>
      
      <div className="flex items-center space-x-2">
        {operation.teaser_url && (
          <Button 
            onClick={handleTeaserDownload}
            size="sm" 
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
          >
            <Download className="mr-2 h-4 w-4" />
            Teaser
          </Button>
        )}
        
        <Button 
          onClick={handleInfoRequest}
          size="sm" 
          className="bg-black hover:bg-gray-800 text-white"
        >
          Solicitar Info
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
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
