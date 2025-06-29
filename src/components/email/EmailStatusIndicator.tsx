
import { EmailStatus } from "@/types/EmailTracking";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, CheckCheck, Mouse } from "lucide-react";

interface EmailStatusIndicatorProps {
  status: EmailStatus;
  openedAt?: string;
  openCount?: number;
}

export const EmailStatusIndicator = ({ status, openedAt, openCount = 0 }: EmailStatusIndicatorProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'SENT':
        return <Check className="h-4 w-4 text-neutral-400" />;
      case 'OPENED':
        return <CheckCheck className="h-4 w-4 text-neutral-600" />;
      case 'CLICKED':
        return <Mouse className="h-4 w-4 text-neutral-800" />;
      default:
        return <Check className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getTooltipContent = () => {
    switch (status) {
      case 'SENT':
        return "Email enviado";
      case 'OPENED':
        return `Email abierto${openedAt ? ` el ${new Date(openedAt).toLocaleString()}` : ''}${openCount > 1 ? ` • Visto ${openCount} veces` : ''}`;
      case 'CLICKED':
        return "Email abierto y enlace clickeado";
      default:
        return "Estado desconocido";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
