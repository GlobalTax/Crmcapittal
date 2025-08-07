import React from 'react';
import { Company } from '@/types/Company';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Briefcase, Users, ExternalLink } from 'lucide-react';

interface CompanyQuickActionsProps {
  company: Company;
  onCreateDeal: (company: Company) => void;
  onCreateContact: (company: Company) => void;
  onViewEinforma: (company: Company) => void;
}

export const CompanyQuickActions = ({
  company,
  onCreateDeal,
  onCreateContact,
  onViewEinforma
}: CompanyQuickActionsProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onCreateDeal(company);
              }}
            >
              <Briefcase className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Nuevo Deal</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onCreateContact(company);
              }}
            >
              <Users className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Nuevo Contacto</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onViewEinforma(company);
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ver eInforma</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};