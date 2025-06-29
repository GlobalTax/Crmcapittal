
import { useState } from "react";
import { TargetCompany } from "@/types/TargetCompany";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  ExternalLink, 
  Star, 
  User, 
  MoreHorizontal,
  Eye,
  Edit,
  ArrowRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TargetCompanyDetailsDialog } from "./TargetCompanyDetailsDialog";
import { EditTargetCompanyDialog } from "./EditTargetCompanyDialog";
import { ConvertToOperationDialog } from "./ConvertToOperationDialog";

interface KanbanCardProps {
  company: TargetCompany;
}

export const KanbanCard = ({ company }: KanbanCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showConvert, setShowConvert] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open details if clicking on dropdown or other interactive elements
    if ((e.target as HTMLElement).closest('.dropdown-trigger')) {
      return;
    }
    setShowDetails(true);
  };

  return (
    <>
      <Card 
        className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-sm text-gray-900 truncate">
                {company.name}
              </h5>
              {company.industry && (
                <p className="text-xs text-gray-500 mt-1">{company.industry}</p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="dropdown-trigger">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowConvert(true)}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Convertir a Operación
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          {/* Website */}
          {company.website && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ExternalLink className="h-3 w-3" />
              <span className="truncate">{company.website}</span>
            </div>
          )}

          {/* Fit Score */}
          {company.fit_score && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-gray-400 fill-current" />
              <span className="text-xs text-gray-600">{company.fit_score}/5</span>
            </div>
          )}

          {/* Revenue */}
          {company.revenue && (
            <div className="text-xs text-gray-600">
              Ingresos: €{(company.revenue / 1000000).toFixed(1)}M
            </div>
          )}

          {/* Contacts Count */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span>{company.contacts?.length || 0} contactos</span>
          </div>

          {/* Description Preview */}
          {company.description && (
            <p className="text-xs text-gray-500 line-clamp-2">
              {company.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showDetails && (
        <TargetCompanyDetailsDialog
          target={company}
          open={showDetails}
          onOpenChange={setShowDetails}
        />
      )}

      {showEdit && (
        <EditTargetCompanyDialog
          target={company}
          open={showEdit}
          onOpenChange={setShowEdit}
        />
      )}

      {showConvert && (
        <ConvertToOperationDialog
          target={company}
          open={showConvert}
          onOpenChange={setShowConvert}
        />
      )}
    </>
  );
};
